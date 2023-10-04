/**
 * meetのリンクを踏んだ際、新たなタブで開かれる分を殺し、新たなウィンドウで開く。
 * ミュート、カメラオフ状態で自動入室する。
 */
(() => {
    const auto_off_config = {
        'マイク': true,
        'カメラ': true,
    }

    // 予期するURLでなければ早期返却
    if (!window.location.href.match(/meet.google.com\/[\w-]+\/?$/g)) {
        return;
    }

    // 新しいタブで開かれた時の処理
    if (window.name === '') {
        // 新しいウィンドウでmeetを開く
        window.open(
            window.location.href,
            'meetPopup',
            'toolbar=0,window.location=0,status=0,menubar=0,scrollbars=0,directories=0,location=0,resizable=yes,width=1000,height=800'
        );

        // タブで開かれた方は閉じる
        window.location.href = 'about:blank';
        window.close();
        return;
    }

    // ポップアップされた meet ウィンドウ用処理
    if (window.name === 'meetPopup') {
        window.addEventListener(
            'load',
            (e) => {
                // 読込終了時に処理実行するためにDOM監視
                const observer = new MutationObserver(() => {
                    const attend_span = Array.from(window.document.querySelectorAll('span')).find(el => el.innerHTML.includes('今すぐ参加'));
                    const attend_button = attend_span ? attend_span.parentElement : null;
                    if (attend_button && !attend_button.disabled) {
                        // カメラ・マイクをミュートにする
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
                observer.observe(document.querySelector('body'), {childList: true});
            }
        );
        return;
    }

})()