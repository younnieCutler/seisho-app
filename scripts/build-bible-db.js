/**
 * scripts/build-bible-db.js
 *
 * 오픈 바이블 CC BY-SA JSON → assets/bible/ko.db 변환 스크립트
 *
 * 출처: https://github.com/thiagobodruk/bible (ko_ko.json — 개역개정)
 * 라이선스: CC BY-SA 4.0
 *
 * 사용법: node scripts/build-bible-db.js
 */

const https = require('https')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const JSON_URL =
  'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json'
const OUTPUT_PATH = path.resolve(__dirname, '../assets/bible/ko.db')

// testament 구분 (book index 기준, 0-based)
// 창세기(0) ~ 말라기(38) = OT (39권), 마태복음(39) ~ 요한계시록(65) = NT (27권)
const OT_COUNT = 39

// 정경 순서 기준 — JSON 배열 인덱스(0-based)로 한국어 이름과 약어 매핑
const BOOKS_META = [
  { name: '창세기', abbr: '창' }, { name: '출애굽기', abbr: '출' }, { name: '레위기', abbr: '레' },
  { name: '민수기', abbr: '민' }, { name: '신명기', abbr: '신' }, { name: '여호수아', abbr: '수' },
  { name: '사사기', abbr: '삿' }, { name: '룻기', abbr: '룻' }, { name: '사무엘상', abbr: '삼상' },
  { name: '사무엘하', abbr: '삼하' }, { name: '열왕기상', abbr: '왕상' }, { name: '열왕기하', abbr: '왕하' },
  { name: '역대상', abbr: '대상' }, { name: '역대하', abbr: '대하' }, { name: '에스라', abbr: '스' },
  { name: '느헤미야', abbr: '느' }, { name: '에스더', abbr: '에' }, { name: '욥기', abbr: '욥' },
  { name: '시편', abbr: '시' }, { name: '잠언', abbr: '잠' }, { name: '전도서', abbr: '전' },
  { name: '아가', abbr: '아' }, { name: '이사야', abbr: '사' }, { name: '예레미야', abbr: '렘' },
  { name: '예레미야애가', abbr: '애' }, { name: '에스겔', abbr: '겔' }, { name: '다니엘', abbr: '단' },
  { name: '호세아', abbr: '호' }, { name: '요엘', abbr: '욜' }, { name: '아모스', abbr: '암' },
  { name: '오바댜', abbr: '옵' }, { name: '요나', abbr: '욘' }, { name: '미가', abbr: '미' },
  { name: '나훔', abbr: '나' }, { name: '하박국', abbr: '합' }, { name: '스바냐', abbr: '습' },
  { name: '학개', abbr: '학' }, { name: '스가랴', abbr: '슥' }, { name: '말라기', abbr: '말' },
  { name: '마태복음', abbr: '마' }, { name: '마가복음', abbr: '막' }, { name: '누가복음', abbr: '눅' },
  { name: '요한복음', abbr: '요' }, { name: '사도행전', abbr: '행' }, { name: '로마서', abbr: '롬' },
  { name: '고린도전서', abbr: '고전' }, { name: '고린도후서', abbr: '고후' }, { name: '갈라디아서', abbr: '갈' },
  { name: '에베소서', abbr: '엡' }, { name: '빌립보서', abbr: '빌' }, { name: '골로새서', abbr: '골' },
  { name: '데살로니가전서', abbr: '살전' }, { name: '데살로니가후서', abbr: '살후' },
  { name: '디모데전서', abbr: '딤전' }, { name: '디모데후서', abbr: '딤후' }, { name: '디도서', abbr: '딛' },
  { name: '빌레몬서', abbr: '몬' }, { name: '히브리서', abbr: '히' }, { name: '야고보서', abbr: '약' },
  { name: '베드로전서', abbr: '벧전' }, { name: '베드로후서', abbr: '벧후' }, { name: '요한일서', abbr: '요일' },
  { name: '요한이서', abbr: '요이' }, { name: '요한삼서', abbr: '요삼' }, { name: '유다서', abbr: '유' },
  { name: '요한계시록', abbr: '계' },
]

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`))
        return
      }
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        try {
          let text = Buffer.concat(chunks).toString('utf8')
          // BOM(Byte Order Mark) 제거
          if (text.charCodeAt(0) === 0xfeff) {
            text = text.slice(1)
          }
          resolve(JSON.parse(text))
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

function buildDb(bibleData) {
  // 기존 파일 제거
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.unlinkSync(OUTPUT_PATH)
    console.log('  기존 ko.db 제거됨')
  }

  const db = new Database(OUTPUT_PATH)

  db.exec(`
    CREATE TABLE books (
      id        INTEGER PRIMARY KEY,
      name      TEXT NOT NULL,
      abbr      TEXT NOT NULL,
      testament TEXT NOT NULL
    );

    CREATE TABLE verses (
      id      INTEGER PRIMARY KEY,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse   INTEGER NOT NULL,
      text    TEXT    NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE INDEX idx_verses ON verses(book_id, chapter, verse);
  `)

  const insertBook = db.prepare(
    'INSERT INTO books (id, name, abbr, testament) VALUES (?, ?, ?, ?)'
  )
  const insertVerse = db.prepare(
    'INSERT INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)'
  )

  let totalVerses = 0

  const insertAll = db.transaction(() => {
    for (let bookIdx = 0; bookIdx < bibleData.length; bookIdx++) {
      const bookData = bibleData[bookIdx]
      const bookId = bookIdx + 1
      const meta = BOOKS_META[bookIdx]
      // JSON의 name은 영어(Genesis 등) → 한국어 이름으로 대체
      const name = meta.name
      const abbr = meta.abbr
      const testament = bookIdx < OT_COUNT ? 'OT' : 'NT'

      insertBook.run(bookId, name, abbr, testament)

      const chapters = bookData.chapters
      for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
        const chapterNum = chIdx + 1
        const verseList = chapters[chIdx]
        for (let vIdx = 0; vIdx < verseList.length; vIdx++) {
          const verseNum = vIdx + 1
          // 이 JSON 소스는 문장 끝에 " !" 접미사가 붙는 경우가 있음 → 제거
          const text = verseList[vIdx].replace(/\s+!$/, '').trim()
          insertVerse.run(bookId, chapterNum, verseNum, text)
          totalVerses++
        }
      }
    }
  })

  insertAll()
  db.close()

  return totalVerses
}

function verify() {
  const db = new Database(OUTPUT_PATH, { readonly: true })

  const gen1v1 = db
    .prepare(
      `SELECT v.text FROM verses v
       JOIN books b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = 1 AND v.verse = 1`
    )
    .get('창세기')

  const totalCount = db.prepare('SELECT COUNT(*) as cnt FROM verses').get()
  const rev22v21 = db
    .prepare(
      `SELECT v.text FROM verses v
       JOIN books b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = 22 AND v.verse = 21`
    )
    .get('요한계시록')

  db.close()

  return { gen1v1, totalCount, rev22v21 }
}

async function main() {
  console.log('=== ko.db 빌드 시작 ===')
  console.log(`출력 경로: ${OUTPUT_PATH}`)

  console.log('\n[1/3] JSON 다운로드 중...')
  const bibleData = await fetchJson(JSON_URL)
  console.log(`  ${bibleData.length}권 로드 완료`)

  console.log('\n[2/3] SQLite 변환 중...')
  const totalVerses = buildDb(bibleData)
  console.log(`  ${totalVerses.toLocaleString()}절 삽입 완료`)

  console.log('\n[3/3] 검증 중...')
  const { gen1v1, totalCount, rev22v21 } = verify()

  const EXPECTED_GEN1V1 = '태초에 하나님이 천지를 창조하시니라'
  const EXPECTED_TOTAL = 31102

  let pass = true

  if (gen1v1?.text === EXPECTED_GEN1V1) {
    console.log(`  ✅ 창세기 1:1 = "${gen1v1.text}"`)
  } else {
    console.error(`  ❌ 창세기 1:1 불일치: "${gen1v1?.text}"`)
    pass = false
  }

  if (totalCount.cnt === EXPECTED_TOTAL) {
    console.log(`  ✅ 총 절 수 = ${totalCount.cnt.toLocaleString()}절`)
  } else {
    // 번역본에 따라 절 수 차이 가능 — 경고만 표시, 빌드 실패 처리 안 함
    console.log(
      `  ℹ️  총 절 수 = ${totalCount.cnt.toLocaleString()}절 (참고값: ${EXPECTED_TOTAL.toLocaleString()}절)`
    )
  }

  if (rev22v21) {
    console.log(`  ✅ 요한계시록 22:21 조회 정상`)
  } else {
    console.error('  ❌ 요한계시록 22:21 조회 실패')
    pass = false
  }

  if (pass) {
    console.log('\n✅ ko.db 빌드 완료')
  } else {
    console.error('\n❌ 검증 실패 — 데이터를 확인하세요')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('빌드 실패:', err)
  process.exit(1)
})
