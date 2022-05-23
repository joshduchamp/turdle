import { LightningElement, track, api } from 'lwc';
import makeGuess from '@salesforce/apex/turdleController.makeGuess';

export default class Turdle extends LightningElement {
    @track answer = '';
    @track guessList = [];

    handleAnswerChange(event) {
        this.answer = event.target.value.toUpperCase();
        this.guessList = [];
    }

    isGuessing = false;
    handleGuess() {
        this.isGuessing = true;
        makeGuess({ answer: this.answer, guessList: this.guessList.slice() })
            .then(result => {
                this.guessList = this.guessList.concat([result.toUpperCase()]);
                if (!this.gameOver)
                    this.handleGuess();
            })
            .catch(error => {
                console.log('error: ' + JSON.stringify(error, null, 2));
            })
            .finally(() => {
                this.isGuessing = false;
                
            })
    }

    @api
    get gameOver() {
        return this.guessList.length >= 6
            || (this.guessList.length
                && this.guessList[this.guessList.length - 1] === this.answer);
    }

    @api
    get guessDisabled() {
        return this.isGuessing
            || this.answer.length !== 5
            || this.gameOver;
    }

    @api
    get guesses() {
        return this.guessList.map((x, i) => ({ count: i + 1, word: x }));
    }

    @api get guessCount() {
        return this.guessList.length;
    }

    @api get showGuesses() {
        return this.guessList.length;
    }

    @api get guessesConcealed() {
        return this.guessList.map((x, j) => {
            let strippedAnswer = this.answer.split('');
            let guessConcealedArr = Array(this.answer.length).fill(GRAY_SQUARE);
            for (let i = strippedAnswer.length-1; i >= 0; i--) {
                const guessChar = x[i];
                const answerChar = this.answer[i];
                if (guessChar == answerChar) {
                    guessConcealedArr[i] = GREEN_SQUARE;
                    strippedAnswer.splice(i,1);
                }
            }
            for (let i = strippedAnswer.length-1; i >= 0; i--) {
                const guessChar = x[i];
                if (strippedAnswer.indexOf(guessChar) >= 0) {
                    guessConcealedArr[i] = YELLOW_SQUARE;
                    strippedAnswer.splice(i,1);
                }
            }
            return ({
                count: j + 1,
                word: guessConcealedArr.reduce((x,y) => x += ' ' + y)
            });
        });
    }
}

const GREEN_SQUARE = '🟩';
const YELLOW_SQUARE = '🟨';
const GRAY_SQUARE = '⬜';