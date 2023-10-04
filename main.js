/**
 * Google Meet が新しいタブで開かれた際、新たなウィンドウで開きなおす。
 * NOTE: macでブラウザ全画面表示時はOS/ブラウザの仕様でタブで開かれる。
 *
 * auto_off_config の設定によりマイク、カメラオフ状態で自動入室する。
 */
(() => {
  /**
   * @type {{ マイク: boolean, カメラ: boolean }}
   * Google Meet 自動入室時にオフにするものに true を指定
   */
  const auto_off_config = {
    'マイク': true,
    'カメラ': true,
  }

  // 予期するURLでなければ早期返却
  if (!window.location.href.match(/meet.google.com\/\w+-\w+-\w+\/?$/g)) {
    return;
  }

  // 新しいタブで開かれたときの処理
  if (window.name === '') {
    // 新しいウィンドウで Google Meet を開く
    const meetPopupWindow = window.open(
      window.location.href,
      'meetPopup',
      'scrollbars=0,resizable=1,menubar=0,toolbar=0,location=0,directories=0,status=0'
    );
    meetPopupWindow.focus();

    // タブで開かれた方は閉じる
    window.location.href = 'about:blank';
    window.close();
    return;
  }

  // 新しいウィンドウで開かれた Google Meet ウィンドウ用処理
  if (window.name === 'meetPopup') {
    window.addEventListener(
      'load',
      (e) => {
        // 読込終了時に処理実行するために DOM 監視
        const observer = new MutationObserver(() => {
          console.log(window.document.readyState);
          const attend_span = Array.from(window.document.querySelectorAll('span')).find(el => el.innerText.includes('今すぐ参加'));
          const attend_button = attend_span ? attend_span.parentElement : null;
          if (attend_button && !attend_button.disabled) {
            // auto_off_config 設定よりカメラ・マイクをミュートにする
            Array.from(window.document.querySelectorAll('div[data-tooltip*=をオフ]')).forEach(el => {
              const off_target = el.dataset.tooltip.match(/^([^ ]*)をオフ/u)[1];
              if (auto_off_config[off_target]) {
                el.click();
              }
            });

            // 自動参加
            attend_button.click();
            observer.disconnect();
          }
        });
        observer.observe(window.document.querySelector('body'), {childList: true});
      }
    );
    return;
  }

})();
