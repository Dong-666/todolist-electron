exports.default = async function afterPack(context) {
  // Skip signing for Windows
  if (context.electronPlatformName === 'win32') {
    return
  }
}