import { useEffect } from 'react';

const OpenExternalBrowser: React.FC = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const currentUrl = window.location.href;

    const inappdeny_exec_vanillajs = (callback: () => void) => {
      if (document.readyState !== 'loading') {
        callback();
      } else {
        document.addEventListener('DOMContentLoaded', callback);
      }
    };

    const copyToClipboard = (val: string) => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.value = val;
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    };

    const redirect = () => {
      if (userAgent.includes('kakaotalk')) {
        window.location.href =
          'kakaotalk://web/openExternal?url=' + encodeURIComponent(currentUrl);
      } else if (userAgent.includes('line')) {
        window.location.href =
          currentUrl.indexOf('?') !== -1
            ? currentUrl + '&openExternalBrowser=1'
            : currentUrl + '?openExternalBrowser=1';
      } else if (
        userAgent.match(
          /inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|SamsungBrowser\/[^1]/i,
        )
      ) {
        if (/iphone|ipad|ipod/.test(userAgent)) {
          alert(
            'URL주소가 복사되었습니다.\n\nSafari가 열리면 주소창을 길게 터치한 뒤, "붙여놓기 및 이동"를 누르면 정상적으로 이용하실 수 있습니다.',
          );
          copyToClipboard(currentUrl);
          window.location.href = 'x-web-search://?';
        } else {
          window.location.href =
            'intent://' +
            currentUrl.replace(/https?:\/\//i, '') +
            '#Intent;scheme=https;package=com.android.chrome;end';
        }
      }
    };

    inappdeny_exec_vanillajs(redirect);
  }, []);

  return null;
};

export default OpenExternalBrowser;
