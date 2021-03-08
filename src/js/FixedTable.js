// ----------------------------
// ★メモ★
// col ... 列（たて）
// row ... 行（よこï）
// ----------------------------

// eslint-disable-next-line no-unused-vars
class FixedTable {
  constructor(el, option) {
    this.wrap = el;
    this.wrapHtml = el.innerHTML;
    this.originTableWrap = null;
    this.originTable = null;
    this.originTableW = null;
    this.originTableH = null;
    this.cloneTableWrap = null;
    this.cloneTable = null;
    this.type = null;
    this.scrollFlag = false;
    this.isScrollTimerId = null;
    this.isResizeTimerId = null;

    // option
    this.noOption = typeof option === 'undefined' ? true : false;
    if (this.noOption) return false;
    this.option = {
      afterInit: typeof option.afterInit === 'function' ? option.afterInit : null,
      startScroll: typeof option.startScroll === 'function' ? option.startScroll : typeof option.startScroll === 'undefined' ? null : null,
      finishScroll: typeof option.finishScroll === 'function' ? option.finishScroll : typeof option.finishScroll === 'undefined' ? null : null,
      noScrollbar: typeof option.noScrollbar === 'boolean' ? option.noScrollbar : typeof option.noScrollbar === 'undefined' ? null : null,
      customizeScrollbar: typeof option.customizeScrollbar === 'boolean' ? option.customizeScrollbar : typeof option.customizeScrollbar === 'undefined' ? null : null,
      resizeTimer: typeof option.resizeTimer === 'number' ? option.resizeTimer : typeof option.resizeTimer === 'undefined' ? 200 : 200,
      scrollTimer: typeof option.scrollTimer === 'number' ? option.scrollTimer : typeof option.scrollTimer === 'undefined' ? 200 : 200,
    };
  }

  init() {
    this.wrap.classList.add('fixedTable--before', 'fixedTable');
    this.originTableWrap = this.wrap.children[0];
    this.originTable = this.originTableWrap.children[0];
    this.wrapW = this.wrap.offsetWidth;
    this.wrapH = this.wrap.offsetHeight;
    this.originTableWrapW = this.originTableWrap.offsetWidth;
    this.originTableWrapH = this.originTableWrap.offsetHeight;
    this.originTableW = this.originTable.offsetWidth;
    this.originTableH = this.originTable.offsetHeight;
    this.direction = this.wrap.getAttribute('data-direction');
    this.setFixedStyle();
    console.log(this.option);
  }

  // ----------------------------
  // テーブルの種類わけ
  // ----------------------------
  setFixedStyle() {
    let promise = Promise.resolve();

    let setHtmlCss = () => {
      // 縦横スクロールのクラスがついていたら
      if (this.direction === 'vh') {
        console.log('縦横');
        this.type = 'vh';
        this.maxHeight = this.wrap.getAttribute('data-height');

        //本当に縦横スクロールすべきか判断する
        if (this.judgeOverflow() === 'vh') {
          this.wrap.classList.add('fixedTable--vh');
          this.colneFourTable();
          this.setFirxedColRowStyle();
          this.setFirxedColRowEvent();
          this.setResizeEventListner();
        } else if (this.judgeOverflow() === 'h') {
          this.type = 'h';
          this.wrap.classList.add('fixedTable--h');
          this.colneTable();
          this.setFirxedColStyle();
          this.setResizeEventListner();
          this.setScrollEventListner();
        } else if (this.judgeOverflow() === 'v') {
          this.type = 'v';
          this.wrap.classList.add('fixedTable--v');
          this.colneTable();
          this.setFirxedRowStyle();
          this.setResizeEventListner();
          this.setScrollEventListner();
        }
        // 横スクロールだったら
      } else if (this.direction === 'horizontal') {
        console.log('横');
        this.type = 'h';
        this.wrap.classList.add('fixedTable--h');
        this.colneTable();
        this.setFirxedColStyle();
        this.setResizeEventListner();
        this.setScrollEventListner();
        // 縦スクロールだったら
      } else if (this.direction === 'vertical') {
        console.log('縦');
        this.type = 'v';
        this.wrap.classList.add('fixedTable--v');
        this.maxHeight = this.wrap.getAttribute('data-height');
        this.colneTable();
        this.setFirxedRowStyle();
        this.setResizeEventListner();
        this.setScrollEventListner();

        // 縦も横もスクロールしない
      } else {
        this.wrap.classList.add('fixedTable--noScr');
      }
    };

    let toggleClass = () => {
      this.wrap.classList.remove('fixedTable--before');
      this.wrap.classList.add('fixedTable--active');
    };

    let initCallbackFunc = () => {
      if (this.noOption) {
        return false;
      } else if (typeof this.option.afterInit === 'function') {
        return this.option.afterInit.call(this);
      }
    };

    promise
      .then(() => {
        return new Promise((resolve) => {
          setHtmlCss();
          resolve();
          console.log('setHtmlCss');
        });
      })
      .then(() => {
        return new Promise((resolve) => {
          toggleClass();
          resolve();
          console.log('toggleClass');
        });
      })
      .then(() => {
        // optionのafterInitの指定がある場合最後に実行
        initCallbackFunc();
      });
  }

  // ----------------------------
  // オリジナルのテーブルを複製してクローン作成
  // ----------------------------
  colneTable() {
    let cloneTableWrap = this.originTableWrap.cloneNode(true);
    this.originTableWrap.setAttribute('class', 'fixedTable-origin-wrap');
    cloneTableWrap.setAttribute('class', 'fixedTable-clone-wrap');
    this.wrap.appendChild(cloneTableWrap);

    this.cloneTableWrap = this.wrap.children[1];
    this.cloneTable = this.cloneTableWrap.children[0];

    this.originTable.setAttribute('class', 'fixedTable-origin-table');
    this.cloneTable.setAttribute('class', 'fixedTable-clone-table');
    this.cloneTableWrap.setAttribute('aria-hidden', 'true');
  }

  // ----------------------------
  // オリジナルのテーブルを4つ複製してクローン作成
  // ----------------------------
  colneFourTable() {
    let topLeftTableNode = this.originTableWrap.cloneNode(true);
    let topRightTableNode = this.originTableWrap.cloneNode(true);
    let bottomLeftTableNode = this.originTableWrap.cloneNode(true);
    let bottomRightTableNode = this.originTableWrap.cloneNode(true);

    this.originTableWrap.setAttribute('class', 'fixedTable-origin-wrap');

    //左上
    topLeftTableNode.setAttribute('class', 'fixedTable-tl-wrap');
    this.wrap.appendChild(topLeftTableNode);
    this.topLeftTableWrap = this.wrap.children[1];

    //右上
    let topRightWrap = document.createElement('div'); // div要素作成
    topRightWrap.setAttribute('class', 'fixedTable-tr-wrap');
    this.wrap.appendChild(topRightWrap);
    this.topRightTableWrap = this.wrap.children[2];
    this.topRightTableWrap.appendChild(topRightTableNode);

    //左下
    let bottomLeftWrap = document.createElement('div'); // div要素作成
    bottomLeftWrap.setAttribute('class', 'fixedTable-bl-wrap');
    this.wrap.appendChild(bottomLeftWrap);
    this.bottomLeftTableWrap = this.wrap.children[3];
    this.bottomLeftTableWrap.appendChild(bottomLeftTableNode);

    //右下
    bottomRightTableNode.setAttribute('class', 'fixedTable-br-wrap');
    this.wrap.appendChild(bottomRightTableNode);
    this.bottomRightTableWrap = this.wrap.children[4];
  }

  // ----------------------------
  // 横スクロールのstyle指定
  // 列見出しが固定になり、横にスクロールする
  // ----------------------------
  setFirxedColStyle() {
    // 横固定分の幅取得
    this.getFIxedColInfo();
    this.getBorderWidth();

    this.originTableWrap.style.marginLeft = this.fixedColWidth + this.borderWidth + 'px';
    this.originTable.style.marginLeft = -this.fixedColWidth - this.borderWidth + 'px';
    this.cloneTableWrap.style.width = this.fixedColWidth + this.borderWidth + 'px';
    this.cloneTableWrap.style.overflow = 'hidden';
  }

  // ----------------------------
  // 縦スクロールのstyle指定
  // ----------------------------
  setFirxedRowStyle() {
    this.getFIxedColInfo();
    this.getBorderWidth();

    let scrollContHeight = this.wrap.getAttribute('data-height');
    this.originTableWrap.style.marginTop = `${this.fixedColHeight + this.borderWidth}px`;
    this.originTable.style.marginTop = `-${this.fixedColHeight + this.borderWidth}px`;
    this.cloneTableWrap.style.height = `${this.fixedColHeight + this.borderWidth}px`;
    this.cloneTableWrap.style.overflow = 'hidden';

    // max-heightの高さより高い場合、max-heightを指定しスクロールバーを表示
    // 表示したスクロールの幅を取得して固定見出しの幅から引く
    if (this.originTable.offsetHeight > scrollContHeight) {
      this.originTableWrap.style.maxHeight = `${scrollContHeight}px`;
      this.getScrollbarWidth();
      this.cloneTableWrap.style.width = `${this.wrap.offsetWidth - this.scrollbarW}px`;
    } else {
      this.cloneTableWrap.style.width = ``;
    }
  }

  // ----------------------------
  // 縦横スクロールのstyle指定
  // ----------------------------
  setFirxedColRowStyle() {
    this.getFIxedColInfo();
    this.getBorderWidth();
    this.getScrollbarWidth();

    let scrollContHeight = this.wrap.getAttribute('data-height');
    let fixedH = this.fixedColHeight + this.borderWidth;
    let fixedW = this.fixedColWidth + this.borderWidth;

    this.wrap.style.maxHeight = `${scrollContHeight}px`;

    // 左上
    this.topLeftTableWrap.style.width = fixedW + 'px';
    this.topLeftTableWrap.style.height = fixedH + 'px';

    // 右上
    this.topRightTableWrap.style.left = fixedW + 'px';
    this.topRightTableWrap.style.height = `${fixedH + this.scrollbarW}px`;
    this.topRightTableWrap.style.width = `${this.wrap.offsetWidth - this.scrollbarW - fixedW}px`;
    this.topRightTableWrap.children[0].style.marginLeft = -fixedW + 'px';

    // 左下
    this.bottomLeftTableWrap.style.width = fixedW + this.scrollbarW + 'px';
    this.bottomLeftTableWrap.style.top = fixedH + 'px';
    this.bottomLeftTableWrap.style.height = `${this.wrap.offsetHeight - this.scrollbarW - fixedH}px`;
    this.bottomLeftTableWrap.children[0].style.marginTop = -fixedH + 'px';

    // 右下
    this.bottomRightTableWrap.style.left = fixedW + 'px';
    this.bottomRightTableWrap.style.top = fixedH + 'px';
    this.bottomRightTableWrap.style.width = `${this.wrap.offsetWidth - fixedW}px`;
    this.bottomRightTableWrap.style.height = `${this.wrap.offsetHeight - fixedH}px`;
    this.bottomRightTableWrap.children[0].style.marginTop = -fixedH + 'px';
    this.bottomRightTableWrap.children[0].style.marginLeft = -fixedW + 'px';
  }

  // ----------------------------
  // 固定スクロール分の高さ・幅取得
  // ----------------------------
  getFIxedColInfo() {
    this.fixedColWidth = 0;
    this.fixedColHeight = 0;

    let rowList = this.originTable.getElementsByTagName('tr');
    let rowLen = rowList.length;

    for (let i = 0; i < rowLen; i++) {
      let targetRow = rowList[i];
      // 横固定分は一行目のみ計算できればOK
      if (i == 0) {
        for (let j = 0; j < targetRow.children.length; j++) {
          let targetCell = targetRow.children[j];
          if (targetCell.classList.contains('js-fixedHead')) {
            this.fixedColWidth += targetCell.offsetWidth;
          }
        }
      }

      // 縦固定分は各行の一つ目のセルが計算できればOK
      if (targetRow.children[0].classList.length != 0)
        if (targetRow.children[0].classList.contains('js-fixedHead')) {
          this.fixedColHeight += targetRow.children[0].offsetHeight;
        }
    }
  }

  // ----------------------------
  // 枠線の幅取得
  // ----------------------------
  getBorderWidth() {
    let target = this.originTable.getElementsByTagName('th')[0];
    let cssStyle = getComputedStyle(target, null);
    this.borderWidth = parseInt(cssStyle.getPropertyValue('border-left-width'), 10);
  }
  // ----------------------------
  // スクロールバーの幅取得
  // ----------------------------
  getScrollbarWidth() {
    if (!this.option.noScrollbar) {
      this.scrollbarW = this.wrap.offsetWidth - this.wrap.firstElementChild.clientWidth;
      console.log('スクロールバーの幅:' + this.scrollbarW);
    } else {
      this.scrollbarW = 0;
      this.wrap.classList.add('fixedTable--noBar');
    }
  }
  // ----------------------------
  // 表がスクロールするかしないか判定
  // ----------------------------
  judgeOverflow() {
    let flag;
    if (this.direction === 'v') {
      flag = this.wrap.offsetHeight > this.maxHeight;
    } else if (this.direction === 'h') {
      flag = this.wrap.offsetWidth < this.originTable.offsetWidth;
    } else if (this.direction === 'vh') {
      if (this.wrap.offsetWidth < this.originTable.offsetWidth && this.originTable.scrollHeight > this.maxHeight) {
        flag = 'vh';

        // 縦横指定だけど、横スクしかしない時
      } else if (this.wrap.offsetWidth < this.originTable.offsetWidth && this.originTable.scrollHeight <= this.maxHeight) {
        flag = 'h';

        // 縦横指定だけど、縦スクしかしない時
      } else if (this.wrap.offsetWidth >= this.originTable.offsetWidth && this.originTable.scrollHeight > this.maxHeight) {
        flag = 'v';
      }
    }
    return flag;
  }
  // ----------------------------
  // 縦横スクロールの初回スクロールイベント付与
  // classのメソッドをremoveEventListenerできないので名前つけて保存しておく
  // thisの中身はclassの内容を参照できるように固定にしておく
  // ----------------------------
  setFirxedColRowEvent() {
    this.scrollHandler = this.doScrollLink.bind(this);
    this.scrollEndHandler = this.setScrollEndTimer.bind(this);

    this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
    this.bottomLeftTableWrap.addEventListener('scroll', this.scrollHandler);
    this.topRightTableWrap.addEventListener('scroll', this.scrollHandler);

    this.bottomRightTableWrap.addEventListener('scroll', this.scrollEndHandler);
    this.bottomLeftTableWrap.addEventListener('scroll', this.scrollEndHandler);
    this.topRightTableWrap.addEventListener('scroll', this.scrollEndHandler);
  }
  // ----------------------------
  // リサイズイベント付与
  // ----------------------------
  setResizeEventListner() {
    this.resizeEndHandler = this.setResizeEndTimer.bind(this);
    window.addEventListener('resize', this.resizeEndHandler);
  }
  // ----------------------------
  // スクロールイベント付与
  // ----------------------------
  setScrollEventListner() {
    this.scrollHandler = this.scrollStart.bind(this);
    this.scrollEndHandler = this.setScrollEndTimer.bind(this);
    this.originTableWrap.addEventListener('scroll', this.scrollHandler);
    this.originTableWrap.addEventListener('scroll', this.scrollEndHandler);
  }
  // ----------------------------
  // 縦横スクロールのスクロールイベント連動
  // 右上横スクロール時 = 右下と横スクロールが同期
  // 左下縦スクロール時 = 右下と縦スクロールが同期
  // 右下スクロール時 = 右上と横スクロール、左下と縦スクロールが同期
  // ----------------------------
  doScrollLink(event) {
    this.scrollTargetEl = event.target;
    this.scrollStart(this.scrollTargetEl);

    // 右下スクロールだったら
    if (event.target.classList.contains('fixedTable-br-wrap')) {
      // 右上と左下をスクロールと同期させる
      this.topRightTableWrap.scrollLeft = event.target.scrollLeft;
      this.bottomLeftTableWrap.scrollTop = event.target.scrollTop;

      // 右上スクロールだったら
    } else if (event.target.classList.contains('fixedTable-tr-wrap')) {
      this.bottomRightTableWrap.scrollLeft = event.target.scrollLeft;

      // 左下スクロールだったら
    } else if (event.target.classList.contains('fixedTable-bl-wrap')) {
      this.bottomRightTableWrap.scrollTop = event.target.scrollTop;
    }
  }

  // ----------------------------
  // スクロール開始検知イベント
  // ・スクロール初回時にスクロール破棄
  // ----------------------------
  scrollStart(target) {
    if (!this.scrollFlag) {
      this.scrollFlag = true;
      console.log('スクロール開始検');
      if (this.type === 'vh') {
        this.removeScrollEvent(target);
      }
    }
  }

  // ----------------------------
  // 縦横スクロールのスクロールイベントを破棄
  // ----------------------------
  removeScrollEvent(targetEl) {
    if (this.type === 'vh') {
      if (targetEl.classList.contains('fixedTable-br-wrap')) {
        this.topRightTableWrap.removeEventListener('scroll', this.scrollHandler);
        this.bottomLeftTableWrap.removeEventListener('scroll', this.scrollHandler);
      } else if (targetEl.classList.contains('fixedTable-tr-wrap')) {
        this.bottomRightTableWrap.removeEventListener('scroll', this.scrollHandler);
      } else if (targetEl.classList.contains('fixedTable-bl-wrap')) {
        this.bottomRightTableWrap.removeEventListener('scroll', this.scrollHandler);
      }
    } else {
      this.originTableWrap.removeEventListener('scroll', this.scrollHandler);
    }
  }
  // ----------------------------
  // スクロール終了検知イベント
  // ・スクロール終了時にタイマーと初回スクロールの管理フラグを初期化
  // ----------------------------
  setScrollEndTimer() {
    if (this.isScrollTimerId) {
      window.clearTimeout(this.isScrollTimerId);
    }

    this.isScrollTimerId = setTimeout(() => {
      this.reSetScrollEvent(this.scrollTargetEl);
      this.isScrollTimerId = null;
      this.scrollFlag = false;
    }, this.option.scrollTimer);
  }

  // ----------------------------
  // スクロール終了検知したら再度スクロールイベントを付与する
  // this => bindでthisの内容は固定
  // ----------------------------
  reSetScrollEvent(targetEl) {
    console.log('スクロールイベント再付与');
    if (this.type === 'vh') {
      if (targetEl.classList.contains('fixedTable-br-wrap')) {
        this.topRightTableWrap.addEventListener('scroll', this.scrollHandler);
        this.bottomLeftTableWrap.addEventListener('scroll', this.scrollHandler);
      } else if (targetEl.classList.contains('fixedTable-tr-wrap')) {
        this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
      } else if (targetEl.classList.contains('fixedTable-bl-wrap')) {
        this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
      }
    } else {
      this.originTableWrap.addEventListener('scroll', this.scrollHandler);
    }
  }
  // ----------------------------
  // リサイズ終了検知イベント
  // ・リサイズ終了時にタイマーと初回スクロールの管理フラグを初期化
  // ----------------------------
  setResizeEndTimer() {
    if (this.isResizeTimerId) {
      window.clearTimeout(this.isResizeTimerId);
    }

    this.isResizeTimerId = setTimeout(() => {
      this.resetTableStyle(this.scrollTargetEl);
      this.isResizeTimerId = null;
      this.resizeFlag = false;
    }, this.option.resizeTimer);
  }
  // ----------------------------
  // リサイズ処理
  // ----------------------------
  resetTableStyle() {
    console.log('リサイズ終了');
    this.winW = window.innerWidth;

    // 大枠の横幅が変化した場合、
    // 横スクロールの有無・縦スクロールの有無の両方が変化しうる
    if (this.wrapW !== this.wrap.offsetWidth) {
      if (this.direction === 'vh') {
        //本当に縦横スクロールすべきか判断する
        let prevType = this.type;

        if (this.judgeOverflow() === 'vh') {
          // riseze前も後も縦横スクロールの場合
          if (this.judgeOverflow() === 'vh' && this.judgeOverflow() === prevType) {
            this.setFirxedColRowStyle();
          } else {
            //riseze前後で縦横スクロールが、縦のみもしくは横のみになる
            this.destroyStyle();
            this.init();
          }
        } else if (this.judgeOverflow() === 'h') {
          // riseze前後も横スクロールの場合
          if (this.judgeOverflow() === prevType) {
            this.setFirxedColStyle();

            // reseze前後で横スクロールだけじゃなくなる
          } else {
            this.destroyStyle();
            this.init();
          }
        } else if (this.judgeOverflow() === 'v') {
          if (this.judgeOverflow() === prevType) {
            this.setFirxedRowStyle();
          } else {
            this.destroyStyle();
            this.init();
          }
        }

        // 横スクロールだったら
      } else if (this.direction === 'horizontal') {
        this.setFirxedColStyle();

        // 縦スクロールだったら
      } else if (this.direction === 'vertical') {
        this.setFirxedRowStyle();
      }
    }
  }

  // ----------------------------
  // 破棄
  // ・HTMLをもとに戻す
  // ----------------------------
  destroyStyle() {
    console.log('destroy');
    let cloneEl;
    let remeveStyle = () => {
      this.wrap.removeAttribute('style');
      this.originTableWrap.removeAttribute('style');
      this.originTable.removeAttribute('style');

      this.originTableWrap.classList.remove('fixedTable-origin-wrap');
      this.originTable.classList.remove('fixedTable-origin-table');

      this.originTableWrap = null;
      this.originTable = null;
      this.originTableW = null;
      this.originTableH = null;
      this.cloneTableWrap = null;
      this.cloneTable = null;
      this.type = null;
    };

    if (this.type === 'vh') {
      remeveStyle();
      cloneEl = this.wrap.children[0].outerHTML;
      this.wrap.innerHTML = cloneEl;
      this.wrap.classList.remove('fixedTable--vh');
    } else if (this.type === 'v') {
      remeveStyle();
      cloneEl = this.wrap.querySelectorAll('.fixedTable-clone-wrap')[0];
      cloneEl.parentNode.removeChild(cloneEl);
      this.wrap.classList.remove('fixedTable--v');
    } else if (this.type === 'h') {
      remeveStyle();
      cloneEl = this.wrap.querySelectorAll('.fixedTable-clone-wrap')[0];
      cloneEl.parentNode.removeChild(cloneEl);
      this.wrap.classList.remove('fixedTable--h');
    }
  }
  // ----------------------------
  // reseizeイベントの破棄
  // ----------------------------
  removeEventListener() {
    window.removeEventListener('resize', this.resizeEndHandler);
  }
  // ----------------------------
  // 完全な破棄
  // ----------------------------
  destroy() {
    this.destroyStyle();
    this.removeEventListener();
  }
}
