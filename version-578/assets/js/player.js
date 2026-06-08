(function () {
    function startMoviePlayer(streamUrl) {
        var video = document.getElementById('movie-video');
        var overlay = document.getElementById('player-overlay');
        var playButton = document.getElementById('play-button');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function loadStream() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function playVideo() {
            loadStream();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', playVideo);

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                playVideo();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.startMoviePlayer = startMoviePlayer;
})();
