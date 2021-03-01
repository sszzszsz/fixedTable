// ----------------------------
// ★メモ★
// col ... 列（たて）
// row ... 行（よこï）
// ----------------------------

// eslint-disable-next-line no-unused-vars
class FixedTable {
  constructor(el) {
    this.wrap = el;
    this.wrapHtml = el.innerHTML;
    this.originTableWrap = null;
    this.originTable = null;
    this.originTableW = null;
    this.originTableH = null;
    this.cloneTableWrap = null;
    this.cloneTable = null;
    this.type = null;
  }

  init() {
    this.originTableWrap = this.wrap.children[0];
    this.originTable = this.originTableWrap.children[0];
    this.wrapW = this.wrap.offsetWidth;
    this.wrapH = this.wrap.offsetHeight;
    this.originTableWrapW = this.originTableWrap.offsetWidth;
    this.originTableWrapH = this.originTableWrap.offsetHeight;
    this.originTableW = this.originTable.offsetWidth;
    this.originTableH = this.originTable.offsetHeight;
    this.direction = this.wrap.getAttribute('data-direction');
    this.getScrollbarWidth();
    this.setFixedStyle();
    // console.log(this.originTableWrap, this.originTableW);
    // console.log(this.originTableWrap, this.originTableH);
  }

  // ----------------------------
  // テーブルの種類わけ
  // ----------------------------
  setFixedStyle() {
    // 縦横スクロールのクラスがついていたら
    if (this.direction === 'vh') {
      console.log('縦横');
      this.type = 'vh';
      this.maxHeight = this.wrap.getAttribute('data-height');
      //本当に縦横スクロールすべきか判断する
      let flag = this.judgeOverflow();

      if (flag === true) {
        this.wrap.classList.add('fixedTable--vh');
        this.colneFourTable();
        this.setFirxedColRowStyle();
        this.setFirxedColRowEvent();
      } else if (flag === 'h') {
        this.type = 'h';
        this.wrap.classList.add('fixedTable--h');
        this.colneTable();
        this.setFirxedColStyle();
      } else if (flag === 'v') {
        this.type = 'v';
        this.wrap.classList.add('fixedTable--v');
        this.colneTable();
        this.setFirxedRowStyle();
        // this.wrap.classList.add('fixedTable--vh');
        // this.colneFourTable();
        // this.setFirxedColRowStyle();
        // this.setFirxedColRowEvent();
      }
      // 横スクロールだったら
    } else if (this.direction === 'horizontal') {
      console.log('横');
      this.type = 'h';
      this.wrap.classList.add('fixedTable--h');
      this.colneTable();
      this.setFirxedColStyle();

      // 縦スクロールだったら
    } else if (this.direction === 'vertical') {
      console.log('縦');
      this.type = 'v';
      this.wrap.classList.add('fixedTable--v');
      this.maxHeight = this.wrap.getAttribute('data-height');
      this.colneTable();
      this.setFirxedRowStyle();
      this.resizeEndHandler = this.setResizeEndTimer.bind(this);
      window.addEventListener('resize', this.resizeEndHandler);
    }
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
    console.log('横固定幅：' + this.fixedColWidth);
    console.log('縦固定幅：' + this.fixedColHeight);
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
    this.scrollbarW = this.wrap.offsetWidth - this.wrap.firstElementChild.clientWidth;
    console.log('スクロールバーの幅:' + this.scrollbarW);
  }
  // ----------------------------
  // 表がスクロールするかしないか判定
  // ----------------------------
  judgeOverflow() {
    let flag;
    if (this.type === 'v') {
      flag = this.wrap.offsetHeight > this.maxHeight;
    } else if (this.type === 'h') {
      flag = this.wrap.offsetWidth < this.originTable.offsetWidth;
    } else if (this.type === 'vh') {
      if (this.wrap.offsetWidth < this.originTable.offsetWidth && this.wrap.scrollHeight > this.maxHeight) {
        flag = true;
      } else if (this.wrap.offsetWidth < this.originTable.offsetWidth && this.wrap.scrollHeight <= this.maxHeight) {
        // 縦横指定だけど、横スクしかしない時
        console.log('縦横指定だけど、横スクしかしない');
        flag = 'h';
      } else if (this.wrap.offsetWidth >= this.originTable.offsetWidth && this.wrap.scrollHeight > this.maxHeight) {
        // 縦横指定だけど、縦スクしかしない時
        console.log('縦横指定だけど、縦スクしかしない');
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
    this.scrollFlag = false;
    this.scrollHandler = this.doScrollLink.bind(this);
    this.scrollEndHandler = this.setScrollEndTimer.bind(this);

    this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
    this.bottomLeftTableWrap.addEventListener('scroll', this.scrollHandler);
    this.topRightTableWrap.addEventListener('scroll', this.scrollHandler);

    this.bottomRightTableWrap.addEventListener('scroll', this.scrollEndHandler);
    this.bottomLeftTableWrap.addEventListener('scroll', this.scrollEndHandler);
    this.topRightTableWrap.addEventListener('scroll', this.scrollEndHandler);

    this.resizeEndHandler = this.setResizeEndTimer.bind(this);
    window.addEventListener('resize', this.resizeEndHandler);
  }

  // ----------------------------
  // 縦横スクロールのスクロールイベント連動
  // 右上横スクロール時 = 右下と横スクロールが同期
  // 左下縦スクロール時 = 右下と縦スクロールが同期
  // 右下スクロール時 = 右上と横スクロール、左下と縦スクロールが同期
  // ----------------------------
  doScrollLink(event) {
    this.scrollTargetEl = event.target;
    // event.preventDefault();
    // event.stopPropagation();
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
      this.removeScrollEvent(target);
      this.scrollFlag = true;
    }
  }

  // ----------------------------
  // 縦横スクロールのスクロールイベントを破棄
  // ----------------------------
  removeScrollEvent(targetEl) {
    if (targetEl.classList.contains('fixedTable-br-wrap')) {
      this.topRightTableWrap.removeEventListener('scroll', this.scrollHandler);
      this.bottomLeftTableWrap.removeEventListener('scroll', this.scrollHandler);
    } else if (targetEl.classList.contains('fixedTable-tr-wrap')) {
      this.bottomRightTableWrap.removeEventListener('scroll', this.scrollHandler);
    } else if (targetEl.classList.contains('fixedTable-bl-wrap')) {
      this.bottomRightTableWrap.removeEventListener('scroll', this.scrollHandler);
    }
  }
  // ----------------------------
  // スクロール終了検知イベント
  // ・スクロール終了時にタイマーと初回スクロールの管理フラグを初期化
  // ----------------------------
  setScrollEndTimer() {
    let _this = this;
    this.isScrollTimerId;
    window.clearTimeout(this.isScrollTimerId);

    this.isScrollTimerId = setTimeout(function () {
      _this.reSetScrollEvent(_this.scrollTargetEl);
      _this.isScrollTimerId = null;
      _this.scrollFlag = false;
    }, 200);
  }

  // ----------------------------
  // スクロール終了検知したら再度スクロールイベントを付与する
  // this => bindでthisの内容は固定
  // ----------------------------
  reSetScrollEvent(targetEl) {
    console.log('スクロールイベント再付与');

    if (targetEl.classList.contains('fixedTable-br-wrap')) {
      this.topRightTableWrap.addEventListener('scroll', this.scrollHandler);
      this.bottomLeftTableWrap.addEventListener('scroll', this.scrollHandler);
    } else if (targetEl.classList.contains('fixedTable-tr-wrap')) {
      this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
    } else if (targetEl.classList.contains('fixedTable-bl-wrap')) {
      this.bottomRightTableWrap.addEventListener('scroll', this.scrollHandler);
    }
  }
  // ----------------------------
  // リサイズ終了検知イベント
  // ・リサイズ終了時にタイマーと初回スクロールの管理フラグを初期化
  // ----------------------------
  setResizeEndTimer() {
    let _this = this;
    let isResizeTimerId;
    window.clearTimeout(isResizeTimerId);

    isResizeTimerId = setTimeout(function () {
      _this.resetTableStyle(_this.scrollTargetEl);
      isResizeTimerId = null;
      _this.resizeFlag = false;
    }, 200);
  }
  // ----------------------------
  // リサイズ処理
  // ----------------------------
  resetTableStyle() {
    console.log('リサイズ終了');
    this.winW = window.innerWidth;
    // this.getScrollbarWidth();

    // 大枠の横幅が変化した場合、
    // 横スクロールの有無・縦スクロールの有無の両方が変化しうる
    if (this.wrapW !== this.wrap.offsetWidth) {
      console.log('枠の幅が変化');
      this.judgeOverflow();
      if (this.type === 'vh') {
        this.setFirxedColRowStyle();
      } else if (this.type === 'v') {
        this.setFirxedRowStyle();
      }
    }
  }
  // ----------------------------
  // 破棄
  // ・HTMLをもとに戻す
  // ----------------------------
  destroy() {
    console.log('destroy');
    let cloneEl;
    if (this.type === 'vh') {
      remeveStyle.call(this);
      cloneEl = this.wrap.children[0].outerHTML;
      this.wrap.innerHTML = cloneEl;
      this.wrap.classList.remove('fixedTable--vh');
    } else if (this.type === 'v') {
      remeveStyle.call(this);
      cloneEl = this.wrap.querySelectorAll('.fixedTable-clone-wrap')[0];
      cloneEl.parentNode.removeChild(cloneEl);
      this.wrap.classList.remove('fixedTable--v');
    } else if (this.type === 'h') {
      remeveStyle.call(this);
      cloneEl = this.wrap.querySelectorAll('.fixedTable-clone-wrap')[0];
      cloneEl.parentNode.removeChild(cloneEl);
      this.wrap.classList.remove('fixedTable--h');
    }

    function remeveStyle() {
      this.wrap.removeAttribute('style');
      this.originTableWrap.removeAttribute('style');
      this.originTable.removeAttribute('style');

      this.originTableWrap.classList.remove('fixedTable-origin-wrap');
      this.originTable.classList.remove('fixedTable-origin-table');
    }
  }
}
