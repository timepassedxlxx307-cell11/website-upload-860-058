(function () {
    var stages = Array.prototype.slice.call(document.querySelectorAll('.video-stage'));

    var startStage = function (stage) {
        var video = stage.querySelector('video');
        var stream = stage.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }

        if (!stage.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                stage.hlsInstance = hls;
            } else {
                video.src = stream;
            }
            stage.setAttribute('data-ready', '1');
        }

        stage.classList.add('playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    stages.forEach(function (stage) {
        var overlay = stage.querySelector('.player-overlay');
        var video = stage.querySelector('video');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startStage(stage);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!stage.getAttribute('data-ready')) {
                    startStage(stage);
                }
            });
            video.addEventListener('play', function () {
                stage.classList.add('playing');
            });
        }
    });
}());
