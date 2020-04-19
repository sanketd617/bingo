import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import Swal from 'sweetalert2';
import {faFrown, faGrinHearts} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  game: any;
  waiting = false;
  loading = false;
  user: any;
  gameRef: any;
  player: any;
  started = false;
  xMap = [];
  yMap = [];
  lastSelected = 0;
  clickStack = [];
  bouncing = false;
  bounceTimeout = null;
  selectionDone = false;
  notificationText = '';
  notificationIsVisible = false;
  crossed = [false, false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false];
  isOpponentReady = false;
  isBingo = false;
  winnerIcon = faGrinHearts;
  loserIcon = faFrown;

  constructor(private auth: AuthService, private afs: AngularFirestore, private router: Router, private _route: ActivatedRoute) {
    this.init();
    this.loading = true;
    this.gameRef = this.afs.doc('games/' + this._route.snapshot.params.id);
    this.gameRef.valueChanges().subscribe((game) => {
      this.game = game;
      this.loading = false;
      this.auth.user$.subscribe((user) => {
        this.user = user;
        this.handleChange();
      });
    });
  }

  init() {
    for (let i = 0; i < 25; i++) {
      this.xMap[i] = 'x' + (i % 5);
      this.yMap[i] = 'y' + parseInt((i / 5).toString(), 10);
    }
  }

  handleChange() {
    if (this.game.p1.id === this.user.uid) {
      this.player = 'p1';
      if (this.game.p2.id === null) {
        this.wait();
      } else {
        this.start();
      }
      return;
    }
    if (this.game.p2.id === this.user.uid) {
      this.player = 'p2';
      this.start();
      return;
    }
    if (this.game.p1.id === null) {
      this.player = 'p1';
    } else {
      this.player = 'p2';
    }
    this.gameRef.update({
      [this.player]: {
        id: this.user.uid,
        score: 0,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      crossed: []
    }, {merge: true});
  }

  wait() {
    this.waiting = true;
  }

  start() {
    this.waiting = false;
    this.started = true;
    this.lastSelected = this.getLastFilled(this.game[this.player].board);
    if (this.lastSelected === this.game[this.player].board.length) {
      this.bingo();
      if (this.isBingo) {
        return;
      }
      this.isOpponentReady = 25 === this.getLastFilled(this.game[this.player === 'p1' ? 'p2' : 'p1'].board);
      this.crossCells();
      if (this.isOpponentReady && this.game.crossed.length === 0) {
        this.showNotification('Opponent is ready!');
      } else if (this.isOpponentReady && this.game.crossed.length !== 0) {
        if (this.game.turn === this.player) {
          this.showNotification('Your turn', false);
        } else {
          this.showNotification('Opponent\'s turn', false);
        }
      } else {
        this.showNotification('Waiting for opponent to be ready!');
      }
      this.selectionDone = true;
      return;
    }
    this.selectNext();
  }

  selectNext() {
  }

  cellClicked(index) {
    if (this.game[this.player].board[index] === 0) {
      this.lastSelected++;
      this.game[this.player].board[index] = this.lastSelected;
      this.clickStack.push(index);
      this.bouncing = true;
      clearTimeout(this.bounceTimeout);
      this.bounceTimeout = setTimeout(() => {
        this.bouncing = false;
      }, 150);
      return;
    }
    if (this.lastSelected === 25 && this.game.turn === this.player) {
      this.makeMove(this.game[this.player].board[index], index);
    }
  }

  getLastFilled(board) {
    let last = 0;
    for (const b of board) {
      last = Math.max(last, b);
    }
    return last;
  }

  undo() {
    this.lastSelected--;
    this.lastSelected = Math.max(0, this.lastSelected);
    if (this.clickStack.length > 0) {
      const lastIndex = this.clickStack.pop();
      this.game[this.player].board[lastIndex] = 0;
    }
  }

  doneSelection() {
    this.gameRef.update({
      [this.player]: {
        ...this.game[this.player],
        board: this.game[this.player].board,
      }
    }, {merge: true}).then((response) => {
      this.selectionDone = true;
    });
  }

  bingo() {
    if (this.game.p1.score >= 5) {
      this.isBingo = true;
      if (this.player === 'p1') {
        Swal.fire('You win!').then((result) => {
          this.router.navigate(['']);
        });
      } else {
        Swal.fire('You lose!').then((result) => {
          this.router.navigate(['']);
        });
      }
    }
    if (this.game.p2.score >= 5) {
      this.isBingo = true;
      if (this.player === 'p2') {
        Swal.fire('You win!').then((result) => {
          this.router.navigate(['']);
        });
      } else {
        Swal.fire('You lose!').then((result) => {
          this.router.navigate(['']);
        });
      }
    }
  }

  makeMove(n, index) {
    if (this.crossed[n]) {
      this.showNotification('Already crossed', true, () => {
        this.showNotification('Your turn');
      });
      return;
    }
    const crossedNumbers = this.game.crossed;
    crossedNumbers.push(n);
    this.crossed[n] = true;
    this.gameRef.update({
      p1: {
        ...this.game.p1,
        score: this.getScore(index, this.game.p1.board)
      },
      p2: {
        ...this.game.p2,
        score: this.getScore(index, this.game.p2.board)
      },
      crossed: crossedNumbers,
      turn: this.player === 'p1' ? 'p2' : 'p1'
    }, {merge: true}).then((response) => {
      this.selectionDone = true;
    });
  }

  trackingFn(cell) {
    return cell;
  }

  showNotification(notificationText, autoDismiss = true, onAutoDismiss = null) {
    this.notificationText = notificationText;
    this.notificationIsVisible = true;
    if (autoDismiss) {
      setTimeout(() => {
        this.dismissNotification();
        if (onAutoDismiss instanceof Function) {
          onAutoDismiss();
        }
      }, 5000);
    }
  }

  dismissNotification() {
    this.notificationText = '';
    this.notificationIsVisible = false;
  }

  crossCells() {
    for (const crossedCell of this.game.crossed) {
      for (const b of this.game[this.player === 'p1' ? 'p2' : 'p1'].board) {
        if (b === crossedCell) {
          this.crossed[b] = true;
        }
      }
    }
  }

  getScore(index, flatBoard) {
    let score = 0;
    let flag = true;
    const board = [];
    let ii = 0;
    for (let i = 0; i < 5; i++) {
      const temp = [];
      for (let j = 0; j < 5; j++) {
        temp.push(flatBoard[ii]);
        ii++;
      }
      board.push(temp);
    }
    for (let i = 0; i < 5; i++) {
      flag = true;
      for (let j = 0; j < 5; j++) {
        if (!this.crossed[board[i][j]]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        score++;
      }
      flag = true;
      for (let j = 0; j < 5; j++) {
        if (!this.crossed[board[j][i]]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        score++;
      }
    }
    flag = true;
    for (let i = 0; i < 5; i++) {
      if (!this.crossed[board[i][i]]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      score++;
    }

    flag = true;
    for (let i = 0; i < 5; i++) {
      if (!this.crossed[board[i][5 - i - 1]]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      score++;
    }

    return score;
  }

}
