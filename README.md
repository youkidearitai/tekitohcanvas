# jQuery tekitoh Canvas viewer Plugin

このプラグインは、canvasタグの中に画像を簡単に表示するプラグインです。

# つかいかた

1. ダウンロードしてください。
2. sample.htmlを参考に、組み込んでみてください。

## 簡単なサンプル

        <!DOCTYPE html>
        <html>
        <head>
            <title>test page.</title>
            <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
            <script type="text/javascript" src="/path/to/jquery.tekitohcanvas.js"></script>
            <style type="text/css">
                // 画像をドラッグで移動させている最中
                .moveImage {
                    cursor: move; 
                }
            </style>
        </head>
        <body>
        <canvas id="canvasviewer"></canvas>

        <script type="text/javascript">
            (function($) {
                $("#canvasviewer").canvasviewer("/path/to/imagefile");
            })(jQuery);
        </script>
        </body>
    </html>

# License

see LICENSE file.
