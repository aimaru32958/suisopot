// 「gulp」
const gulp = require("gulp");
// 「sass を css にコンパイル」
const sass = require("gulp-sass")(require("sass"));
// 「自動的にベンダープレフィックスを追加」「cssをソート」
const postcss = require("gulp-postcss");
// 「自動的にベンダープレフィックスを追加」
const autoprefixer = require("autoprefixer");
// 「cssをソート」
const cssSorter = require("css-declaration-sorter");
// 「メディアクエリ コンパイル時にまとめられる」
const mmq = require("gulp-merge-media-queries");
//  「ブラウザの立ち上げ」「変更を検知し、リロードする」
const browserSync = require("browser-sync");
// 「cssの圧縮処理」
const cleanCss = require("gulp-clean-css");
// 「jsの圧縮処理」
const uglify = require("gulp-uglify");
// 「コンパイル後の名称変更」
const rename = require("gulp-rename");
// 「html を 整理」
const htmlBeautify = require("gulp-html-beautify");

// /*==========================================================
// # sassで画像データ参照を正しい構造に自動変換する設定
//  npm install gulp-replace postcss-url
// ===========================================================*/
const postcssUrl = require('postcss-url');
const replace = require('gulp-replace');


function test(done){
    console.log('Hello Gulp');
    done();
}

// 「sassをコンパイル」
function compileSass(){
    return gulp.src("./src/assets/sass/**/*.scss")
    // ここにコンパイルの処理を記載する
    .pipe(sass())                                      // 「sass を css にコンパイル」
    // .pipe(postcss([autoprefixer(),cssSorter()]))    // 「自動的にベンダープレフィックスを追加」「cssをソート」
    .pipe(postcss([autoprefixer()]))                   // 「自動的にベンダープレフィックスを追加」のみ有効にする
    .pipe(mmq())                                       // 「メディアクエリ コンパイル時にまとめられる」
    //　「SCSS画像URLの最適化」 
    .pipe(
      postcss([
        postcssUrl({
          // ここでURLの変換を実行
          url: (asset) => {
            // URLのパスから `../../` を `../` に変換
            return asset.url.replace(/\.\.\/\.\.\/\i\m\g/g, "../img").replace(/\.\.\/\.\.\/\i\m\g/g, "../img");
          },
        }),
      ])
    )
    .pipe(gulp.dest("./public/assets/css/"))                 // 「コンパイル先指定」
    .pipe(cleanCss())                                  // 「cssの圧縮処理」
    .pipe(rename({                                     // 「名称変更」
        suffix:".min"
    }))
    .pipe(gulp.dest("./public/assets/css/"))                 //「コンパイル先指定」
}


// 「各ファイルの編集を検知し、「コンパイル」と「リロード」」
function watch() {
    gulp.watch("./src/assets/sass/**/*.scss" , gulp.series(compileSass,browserReload));
    gulp.watch("./src/assets/js/**/*.js" , gulp.series(minJs,browserReload));
    gulp.watch("./src/assets/img/**/*" , gulp.series(copyImage,browserReload));
    // gulp.watch("./src/**/*.html" , gulp.series(formatHTML,browserReload));
    gulp.watch("./src/**/*.html" , gulp.series(formatHTML,browserReload,gulp.series('create-scss'))); // scssファイルの自動生成 追加
    // gulp.watch("./src/**/*.php" , gulp.series(copyPhpnpx ,browserReload));
}

//「ブラウザの立ち上げ」「変更を検知し、リロードする」
function browserInit(done) {
    browserSync.init({
        // 「静的サイトの場合」
        server:{
            baseDir:"./public/"  
        }
        // 「動的サイトの場合」     // URLを監視し、変更があればブラウザをリロードする
        // proxy:"http://localhost:8888/"
    });
    done();
}

//「リロード」
function browserReload(done) {
    browserSync.reload();
    done();
}

// 「jsをコンパイル,jsの圧縮ファイル生成」
function minJs() {
    return gulp.src("./src/assets/js/**/*.js")
    .pipe(gulp.dest("./public/assets/js/"))    // 複製（通常コンパイル）
    // ここにコンパイルの処理を記載する
    .pipe(uglify())                      // 圧縮処理
    .pipe(rename({                       // 名称変更
        suffix:".min"
    }))                                  
    .pipe(gulp.dest("./public/assets/js/"))    // コンパイル先指定
}

// 「HTMLをコンパイル」
function formatHTML() {
    return gulp.src("./src/**/*.html")
    // コンパイルの処理を記載する
    .pipe(htmlBeautify({                      // html を 整理
        indent_size: 2,                       // インデント幅
        indent_with_tabs: true                // タブでインデントする。falseならスペースでインデント
    }))
    .pipe(gulp.dest("./public/"))
}

// 「imgデータの複製」
function copyImage() {
    return gulp.src("./src/assets/img/**/*")
    // 
    .pipe(gulp.dest("./public/assets/img/"))  // 複製（通常コンパイル）
}

exports.test = test ;
exports.compileSass = compileSass ;
exports.watch = watch ;
exports.browserInit = browserInit ;
exports.dev = gulp.parallel(browserInit,watch) ;
exports.minJs = minJs ;
exports.formatHTML = formatHTML ;
exports.copyImage = copyImage ;
exports.build = gulp.parallel(formatHTML,compileSass,minJs,copyImage);






// /*==========================================================
// # FLOCSS式で記述した際にcomponent,layout,projectに自動付与する設定

// ※始めにターミナルへ npm install gulp gulp-cheerio でインストールが必要
//  自動化するためには npx gulpで監視を起動させておく必要がある
// ===========================================================*/

// function watch() {
//     gulp.watch("./src/assets/sass/**/*.scss",compileSass);
//     gulp.watch("./public/*.html",gulp.series('create-scss'));
// }

// const gulp =require ("gulp");
const cheerio = require('gulp-cheerio');
const fs = require('fs');
const path = require('path');


gulp.task('create-scss', function () {
  return gulp.src('public/**/*.html') // 'public' ディレクトリ内の HTML ファイルを対象に設定
    .pipe(cheerio(function ($) {
      // 各フォルダの _index.scss ファイルのパス
      const layoutIndexScssPath = 'src/assets/sass/layout/_index.scss';
      const projectIndexScssPath = 'src/assets/sass/project/_index.scss';
      const componentIndexScssPath = 'src/assets/sass/component/_index.scss';

      // 各フォルダの _index.scss の内容を読み込む
      let layoutIndexScssContent = fs.existsSync(layoutIndexScssPath) ? fs.readFileSync(layoutIndexScssPath, 'utf8') : '';
      let projectIndexScssContent = fs.existsSync(projectIndexScssPath) ? fs.readFileSync(projectIndexScssPath, 'utf8') : '';
      let componentIndexScssContent = fs.existsSync(componentIndexScssPath) ? fs.readFileSync(componentIndexScssPath, 'utf8') : '';

      $('*[class]').each(function () {
        const classes = $(this).attr('class').split(/\s+/); // HTML の要素からクラス名を取得
        classes.forEach(function (className) {
          let targetPath, indexScssContent;
          const baseClassName = className.split('__')[0]; // '__' が含まれている場合、それより前の部分を取得
          const scssClassName = `_${baseClassName}`; // SCSS ファイル名

          // クラス名の先頭文字に基づいて対応するフォルダと _index.scss の内容を選択
          if (className.startsWith('l')) {
            targetPath = 'src/assets/sass/layout';
            indexScssContent = layoutIndexScssContent;
          } else if (className.startsWith('p')) {
            targetPath = 'src/assets/sass/project';
            indexScssContent = projectIndexScssContent;
          } else if (className.startsWith('c')) {
            targetPath = 'src/assets/sass/component';
            indexScssContent = componentIndexScssContent;
          } else {
            return; // その他のクラス名は無視
          }
					
		  //@use "../global" as global➡*に変更することでglobal.が必要なくなる
          const scssFilePath = path.join(targetPath, scssClassName + '.scss'); // 対応する SCSS ファイルのパスを生成
          if (!fs.existsSync(scssFilePath)) {
            fs.writeFileSync(scssFilePath, `@use "../global" as *;\n\n.${baseClassName} {\n  // スタイルをここに記述\n}`); // SCSS ファイルが存在しない場合に新規作成
            indexScssContent += `@use "${baseClassName}";\n`; // 対応する _index.scss に新しい @use ステートメントを追加
          }

          // 更新された内容で _index.scss ファイルを書き込む
          if (className.startsWith('l')) {
            layoutIndexScssContent = indexScssContent;
          } else if (className.startsWith('p')) {
            projectIndexScssContent = indexScssContent;
          } else if (className.startsWith('c')) {
            componentIndexScssContent = indexScssContent;
          }
        });
      });

      fs.writeFileSync(layoutIndexScssPath, layoutIndexScssContent); // layout の _index.scss を更新
      fs.writeFileSync(projectIndexScssPath, projectIndexScssContent); // project の _index.scss を更新
      fs.writeFileSync(componentIndexScssPath, componentIndexScssContent); // component の _index.scss を更新
    }));
});

// exports.default = watch ;
