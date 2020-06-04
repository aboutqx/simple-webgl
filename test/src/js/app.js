import load from 'load-asset'
import mapAssets from './Assets'
import AssetsInit from './AssetsInit'
import ConsoleLog from 'utils/ConsoleLog'

let assets = {
  wood: './assets/wood.jpg',
  flower: './assets/flower.png'
}
let name = location.search.replace('?', '')

for (let key in mapAssets) {
  if (name.split('/')[1] === key) Object.assign(assets, mapAssets[key])
}
async function loadScene() {
  let files = await load.any(assets, ({
    progress,
    error
  }) => {
    // progressbar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
    if (error) console.error(error)
  })
  window.getAssets = await AssetsInit(assets, files)
  import('./Scene')

}
loadScene()
