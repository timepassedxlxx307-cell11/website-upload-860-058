import { H as Hls } from './hls-vendor.js';

const players = Array.from(document.querySelectorAll('.player-shell'));

players.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-start');

    if (!video || !button) {
        return;
    }

    const track = video.querySelector('source');
    const stream = track ? track.getAttribute('src') : '';
    let prepared = false;
    let engine = null;

    const launch = () => {
        if (!stream) {
            return;
        }

        shell.classList.add('is-playing');

        if (!prepared) {
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (Hls && Hls.isSupported()) {
                engine = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                engine.loadSource(stream);
                engine.attachMedia(video);
                engine.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
                engine.on(Hls.Events.ERROR, (eventName, details) => {
                    if (details && details.fatal && engine) {
                        if (details.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            engine.startLoad();
                        } else if (details.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            engine.recoverMediaError();
                        } else {
                            engine.destroy();
                            engine = null;
                        }
                    }
                });
                return;
            } else {
                video.src = stream;
            }
        }

        video.play().catch(() => {});
    };

    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        launch();
    });

    video.addEventListener('click', () => {
        if (video.paused) {
            launch();
        }
    });

    video.addEventListener('play', () => {
        shell.classList.add('is-playing');
    });

    video.addEventListener('ended', () => {
        shell.classList.remove('is-playing');
    });
});
