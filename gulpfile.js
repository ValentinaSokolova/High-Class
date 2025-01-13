const { src, dest, series, watch} = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const image = require('gulp-image')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const gulpif = require('gulp-if')

let prod = false;

const idProd = (done) =>  {
  prod = true;
  done();
}
//очищает папку ready перед внесением новых изменений
const clean = () => {
  return del(['ready'])
}
//включение в работу всех файлов в папке resources
const resources = () => {
  return src('src/resources/**',{ encoding: false })
  .pipe(dest('ready'))
}
//производит работу со стилями: использует sourcemap для отслеживания док-тов, 
const styles = () => {
    return src('src/css/**/*.css')
    .pipe(gulpif(!prod, sourcemaps.init()))
    //все файлы из укзаного пути будут объединены в styles.css
    .pipe(concat('css/styles.css'))
    //автоматически делает все стили читаемыми для всех браузеров через can i use
    .pipe(autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 2 versions'],
        cascade: false
    }))
    //очищает css от лишней табуляции и пробелов
    .pipe(gulpif(prod, cleanCss({
      level: 2
  })))
    .pipe(gulpif(!prod,sourcemaps.write()))
    .pipe(dest('ready'))
    .pipe(browserSync.stream())
}
//минификация html файла
const htmlMinify = () => {
    return src('src/**/*.html')
    .pipe(gulpif(prod, htmlMin({
        collapseWhitespace: true,
    })))
    .pipe(dest('ready'))
    .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'ready'
    }
  })
}

const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.png',
    'src/img/*.svg',
    'src/img/**/*.jpeg',
    
  ],{ encoding: false })
  .pipe(image())
  .pipe(dest('ready/img'))
}
//контролирует все изменения файлов с соответствующими расширениями и выполняет команду после запятой
watch("src/**/*.html", htmlMinify)
watch("src/css/**/*.css", styles)
watch('src/resources/**', resources)


exports.styles = styles
exports.clean = clean
exports.htmlMinify = htmlMinify
exports.dev = series(clean, htmlMinify, resources, styles, images, watchFiles)
exports.build = series (idProd, clean, htmlMinify, resources, styles, images)