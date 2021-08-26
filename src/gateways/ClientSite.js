const isRunningInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    console.log('caught error');
    return true;
  }
}

export default {
  isRunningInIframe,

  closeOwnPopup() {
    if (!isRunningInIframe()) return;
    window.parent.postMessage(JSON.stringify({command: 'closeYogoFrontend'}), '*');
  },

}
