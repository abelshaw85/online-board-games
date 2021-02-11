import { Injectable, Input } from "@angular/core";

export enum Sound {
  Winner,
  Loser,
  Move,
  Promote
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  public mute: boolean;
  winner = "assets/sound/winner.wav";
  loser = "assets/sound/loser.wav";
  move = "assets/sound/move.wav";
  promote = "assets/sound/promote.wav";

  playAudio(sound: Sound) {
    if (!this.mute) {
      let audio = new Audio();
      switch(sound) {
        case Sound.Winner:
          audio.src = this.winner;
          break;
        case Sound.Loser:
          audio.src = this.loser;
          break;
        case Sound.Move:
          audio.src = this.move;
          break;
        case Sound.Promote:
          audio.src = this.promote;
          break;
      }
      audio.load();
      audio.play();
    }

  }
}

