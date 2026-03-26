const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// .db 파일을 Metro asset으로 등록
module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    assetExts: [...(config.resolver.assetExts ?? []), 'db'],
  },
}
