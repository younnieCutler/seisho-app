// Jest mock for react-native-mmkv (native module)
// 인메모리 Map으로 MMKV 동작 시뮬레이션

class MockMMKV {
  private store = new Map<string, string | number | boolean>()

  getString(key: string): string | undefined {
    const val = this.store.get(key)
    return typeof val === 'string' ? val : undefined
  }

  getNumber(key: string): number | undefined {
    const val = this.store.get(key)
    return typeof val === 'number' ? val : undefined
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.store.get(key)
    return typeof val === 'boolean' ? val : undefined
  }

  set(key: string, value: string | number | boolean): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clearAll(): void {
    this.store.clear()
  }
}

export function createMMKV() {
  return new MockMMKV()
}
