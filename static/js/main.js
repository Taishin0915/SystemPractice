// メインJavaScriptファイル
// 必要に応じて機能を追加

document.addEventListener('DOMContentLoaded', function() {
    // フラッシュメッセージの自動非表示（オプション）
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function(message) {
        setTimeout(function() {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                message.remove();
            }, 500);
        }, 5000);
    });
});

