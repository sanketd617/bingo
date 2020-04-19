import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import {fas} from '@fortawesome/free-solid-svg-icons';

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

  constructor(private auth: AuthService, private afs: AngularFirestore, private _route: ActivatedRoute) {
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
    this.gameRef.update({
      p2: {
        id: this.user.uid,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        crossed: []
      }
    }, {merge: true});
  }

  wait() {
    this.waiting = true;
  }

  start() {
    console.log(this.game[this.player].board);
    this.waiting = false;
    this.started = true;
    this.lastSelected = this.getLastFilled(this.game[this.player].board);
    if (this.lastSelected === this.game[this.player].board.length) {
      console.log('Let begin');
      return;
    }
    this.selectNext();
  }

  selectNext() {
    console.log('Select', this.lastSelected + 1, 'th cell');
  }

  cellClicked(index) {
    console.log('Cell clicked', index);
    if (this.game[this.player].board[index] === 0) {
      this.lastSelected++;
      this.game[this.player].board[index] = this.lastSelected;
      this.clickStack.push(index);
      this.bouncing = true;
      clearTimeout(this.bounceTimeout);
      this.bounceTimeout = setTimeout(() => {
        this.bouncing = false;
      }, 150);
    }
  }

  getLastFilled(board) {
    let last = 0;
    for (const b of board) {
      last = Math.max(last, b);
    }
    return last;
  }

  trackingFn(cell) {
    return cell;
  }

}
