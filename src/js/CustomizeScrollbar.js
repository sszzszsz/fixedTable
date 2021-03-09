// eslint-disable-next-line no-unused-vars
class CustomizeScrollbar {
  constructor(el) {
    this.wrap = el;
    this.scrY = false;
    this.scrX = false;
  }

  init() {
    this.scrArea = this.wrap.children[0];
    this.judgeOverflow();
    this.setHtml();
    this.getStyleInfo();
    this.setEventLisnter();
    console.log(this);
  }

  judgeOverflow() {
    if (this.wrap.clientWidth < this.scrArea.scrollWidth) {
      this.scrX = true;
    }
    if (this.wrap.clientHeight < this.scrArea.scrollHeight) {
      this.scrY = true;
    }
  }

  setHtml() {
    this.barWrap = document.createElement('div');
    this.barWrap.classList.add('cs-barArea');

    if (this.scrX) {
      this.xBarWrap = document.createElement('div');
      this.xBarWrap.classList.add('cs-xBarArea');
      this.xBar = document.createElement('div');
      this.xBar.classList.add('cs-xBar');
      this.xBarWrap.appendChild(this.xBar);
      this.barWrap.appendChild(this.xBarWrap);
    }
    if (this.scrY) {
      this.yBarWrap = document.createElement('div');
      this.yBarWrap.classList.add('cs-yBarArea');
      this.yBar = document.createElement('div');
      this.yBar.classList.add('cs-yBar');
      this.yBar.setAttribute('draggable', 'false');
      this.yBarWrap.appendChild(this.yBar);
      this.barWrap.appendChild(this.yBarWrap);
    }

    this.wrap.appendChild(this.barWrap);
  }

  getStyleInfo() {
    this.scrAreaH = this.scrArea.scrollHeight;
    this.scrAreaW = this.scrArea.scrollWidth;

    if (this.scrY) {
      this.yBarWrapW = this.yBarWrap.clientWidth;
      this.yBarH = this.yBar.clientHeight;
      this.scrBarAreaH = this.yBarWrap.clientHeight;
      this.wrap.style.paddingRight = `${this.yBarWrapW}px`;
    }
    if (this.scrX) {
      this.xBarWrapH = this.xBarWrap.clientHeight;
      this.xBarW = this.xBar.clientWidth;
      this.scrBarAreaW = this.xBarWrap.clientWidth;
      this.wrap.style.paddingBottom = `${this.xBarWrapH}px`;
    }
  }

  setEventLisnter() {
    this.scrAreaEvent = this.linkBar.bind(this);
    this.scrArea.addEventListener('scroll', this.scrAreaEvent);

    this.addEvent = this.addMoveEventListner.bind(this);
    this.removeEvent = this.removeMoveEventListner.bind(this);
    this.moveEvent = this.moveBar.bind(this);

    if (this.scrY) {
      this.yBarWrap.addEventListener('pointerdown', this.addEvent);
      this.yBarWrap.addEventListener('pointerup', this.removeEvent);
      this.yBarWrap.addEventListener('pointerleave', this.removeEvent);
    }
    if (this.scrX) {
      this.xBarWrap.addEventListener('pointerdown', this.addEvent);
      this.xBarWrap.addEventListener('pointerup', this.removeEvent);
      this.xBarWrap.addEventListener('pointerleave', this.removeEvent);
    }
  }

  linkBar(e, x, y) {
    if (this.scrY) {
      //実際にバーが移動する距離
      let barMoveAreaY = this.scrBarAreaH - this.yBarH; // 200 - 20 = 180
      //実際にスクロールする量
      let scrollAreaY = this.scrAreaH - this.scrBarAreaH; // 800 - 200 = 600

      if (e.type === 'scroll') {
        // スクロールできる範囲に対して実際スクロールした割合
        let scrRelativeValue = e.target.scrollTop / scrollAreaY; // 400スクロールしたとき /600 = 0.666（60%分スクロールした）
        let yPos = barMoveAreaY * scrRelativeValue; // 180 * 0.6666
        this.yBar.style.transform = `translateY(${yPos}px)`;
      } else if (e.type === 'pointermove') {
        // スクロールバーと連動させてコンテンツ部分をスクロールさせるとスクロールイベントが発生してしまうので一旦オフする
        this.scrArea.removeEventListener('scroll', this.scrAreaEvent);
        let barRelativeValue = y / barMoveAreaY; // 100スクロールしたとき /180
        let yPos = scrollAreaY * barRelativeValue;
        this.scrArea.scrollTop = yPos;
      }
    }

    if (this.scrX) {
      //実際にバーが移動する距離
      let barMoveAreaW = this.scrBarAreaW - this.xBarW; // 200 - 20 = 180
      //実際にスクロールする量
      let scrollAreaW = this.scrAreaW - this.scrBarAreaW; // 800 - 200 = 600

      if (e.type === 'scroll') {
        let scrRelativeValue = e.target.scrollLeft / scrollAreaW; // 400スクロールしたとき /600 = 0.666（60%分スクロールした）
        let xPos = barMoveAreaW * scrRelativeValue; // 180 * 0.6666
        this.xBar.style.transform = `translateX(${xPos}px)`;
      } else if (e.type === 'pointermove') {
        // スクロールバーと連動させてコンテンツ部分をスクロールさせるとスクロールイベントが発生してしまうので一旦オフする
        this.scrArea.removeEventListener('scroll', this.scrAreaEvent);
        let barRelativeValue = x / barMoveAreaW; // 100スクロールしたとき /180
        let xPos = scrollAreaW * barRelativeValue;
        this.scrArea.scrollLeft = xPos;
      }
    }
  }

  addMoveEventListner(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('addMoveEventListner');
    if (!this.scrBarFlag) {
      if (this.scrY) {
        this.yBarWrap.addEventListener('pointermove', this.moveEvent);
      }
      if (this.scrX) {
        this.xBarWrap.addEventListener('pointermove', this.moveEvent);
      }
    }
    this.scrBarFlag = true;
  }
  removeMoveEventListner() {
    if (this.scrBarFlag) {
      console.log('removeMoveEventListner');
      if (this.scrY) {
        this.yBarWrap.removeEventListener('pointermove', this.moveEvent);
      }
      if (this.scrX) {
        this.xBarWrap.removeEventListener('pointermove', this.moveEvent);
      }
      // スクロールバーと連動が終了するタイミングで再度スクロールイベントをオン
      this.scrArea.addEventListener('scroll', this.scrAreaEvent);
    }
    this.scrBarFlag = false;
  }

  moveBar(e) {
    e.preventDefault();
    e.stopPropagation();
    let target_rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - target_rect.left;
    let y = e.clientY - target_rect.top;
    console.log('(x, y) = (' + x + ',' + y + ')');

    if (this.scrY) {
      // スクロール値がバーの半分の高さより小さくなった場合、バーを上付きにする
      if (y < this.yBarH / 2) {
        this.yBar.style.transform = `translateY(0px)`;
      } else if (y > this.scrBarAreaH - this.yBarH / 2) {
        this.yBar.style.transform = `translateY(${this.scrBarAreaH - this.yBarH}px)`;
      } else {
        this.yBar.style.transform = `translateY(${y - this.yBarH / 2}px)`;
      }
    }

    if (this.scrX) {
      if (x < this.xBarW / 2) {
        this.xBar.style.transform = `translateY(0px)`;
      } else if (y > this.scrBarAreaH - this.xBarW / 2) {
        this.xBar.style.transform = `translateY(${this.scrBarAreaW - this.xBarW}px)`;
      } else {
        this.xBar.style.transform = `translateY(${y - this.xBarW / 2}px)`;
      }
    }
    this.linkBar.call(this, e, x, y);
  }
}
