const LINK_DATA = 'https://vmutest.github.io/dumdls/data.txt';
const TIME_DELAY = 2000;

const RIGHT_ANSWER = 'right';
const WRONG_ANSWER = 'wrong';
const NONE_ANSWER = 'none';

window.addEventListener('load', async function () {
    // load text from data link
    const text = await fetch(LINK_DATA).then((response) => response.text());

    // list questions
    let listQuestion = text
        .split(/\n\s*\n/) // split the text by empty lines
        .map((group) =>
            group.split('\n').map((line) => line.replace(/\r/g, ''))
        ) // split the text by new lines
        .map((group, index) => ({
            question: group[0], // first line is the question
            listAnswered: group.slice(1), // other lines are the answers
            answered: null, // answered by the user
            result: NONE_ANSWER, // result of the question
            index,
        })); // create an object for each question

    // Get some elements from the DOM
    const questionEl = document.getElementById('question');
    const answerContainerEl = document.getElementById('answer-container');
    const btnPrevEl = document.getElementById('btn-prev');
    const btnNextEl = document.getElementById('btn-next');
    const gridQuestionContainerEl = document.getElementById(
        'grid-question-container'
    );

    const questionArea = document.getElementById('question-area');
    const resultArea = document.getElementById('result-area');

    const btnResetWrongEl = document.getElementById('btn-reset-wrong');

    function resetWrong() {
        listQuestion = listQuestion.filter((question) => {
            if (question.result !== RIGHT_ANSWER) {
                question.result = NONE_ANSWER;
                question.answered = null;
                return true;
            } else {
                const gridQuestionEl = document.getElementById(
                    `grid-question-item-${question.index}`
                );
                gridQuestionContainerEl.removeChild(gridQuestionEl);
                return false;
            }
        });
        showQuestion(listQuestion[0].index);
    }

    btnResetWrongEl.addEventListener('click', () => {
        resetWrong();
        updateGridQuestion();
    });

    const showResultArea = () => {
        questionArea.style.display = 'none';
        resultArea.style.display = 'block';
    };

    const showQuestionArea = () => {
        questionArea.style.display = 'block';
        resultArea.style.display = 'none';
    };

    // Create a grid of questions
    listQuestion.forEach(({ index }) => {
        const gridQuestionEl = document.createElement('div');
        gridQuestionEl.classList.add('grid-question-item');
        gridQuestionEl.id = `grid-question-item-${index}`;
        gridQuestionEl.innerText = index + 1;
        gridQuestionEl.addEventListener('click', () => {
            showQuestion(index);
            tabNavEls[0].click(); // show the first tab
        });
        gridQuestionContainerEl.appendChild(gridQuestionEl);
    });

    function updateGridQuestion() {
        listQuestion.forEach((question) => {
            const gridQuestionEl = document.getElementById(
                `grid-question-item-${question.index}`
            );
            gridQuestionEl.classList.remove('active');
            gridQuestionEl.classList.remove('right');
            gridQuestionEl.classList.remove('wrong');
            gridQuestionEl.classList.add(question.result);
            if (question.index === currentQuestionIndex) {
                gridQuestionEl.classList.add('active');
            }
        });
    }

    function showQuestion(qsNum) {
        clearTimeout(nextTimeOut);
        showQuestionArea();
        currentQuestionIndex = qsNum; // update current question index

        // if qsNum is out of range, call showResult function
        if (qsNum >= listQuestion.length) return showResult();

        const data = listQuestion[qsNum];
        questionEl.innerText = data.question; // show question

        answerContainerEl.innerHTML = ''; // clear all answers

        // if answered, add class 'answered' to the answer container
        if (data.answered !== null) {
            answerContainerEl.classList.add('answered');
        } else {
            // if not answered, remove class 'answered' to the answer container
            answerContainerEl.classList.remove('answered');
        }

        for (let i = 0; i < data.listAnswered.length; i++) {
            // create answer element
            const answerEl = document.createElement('li');
            answerEl.classList.add('answer');

            // get answer
            let answer = data.listAnswered[i];

            // if answer is correct, add class vmu and replace '*' symbol
            if (answer.startsWith('*')) {
                answerEl.classList.add('vmu');
                answer = answer.replace('*', '').trim();
            }

            // if answer is selected, add class selected
            if (data.answered === i) {
                answerEl.classList.add('selected');
            }

            // add answer to answer container
            answerEl.innerText = answer;
            answerContainerEl.appendChild(answerEl);

            // add event listener to answer element if not answered
            if (data.answered === null) {
                answerEl.addEventListener('click', function () {
                    // save the answer
                    data.answered = i;

                    // add class answered to answer container
                    answerContainerEl.classList.add('answered');

                    // check if the answer is correct
                    if (answerEl.classList.contains('vmu')) {
                        data.result = RIGHT_ANSWER;
                    } else {
                        data.result = WRONG_ANSWER;
                    }

                    // toggle the selected class
                    answerEl.classList.toggle('selected');

                    updateGridQuestion();

                    // show the next question after 3 seconds or show the result if it's the last question
                    if (qsNum < listQuestion.length - 1) {
                        nextTimeOut = setTimeout(nextQuestion, TIME_DELAY);
                    } else {
                        showResult();
                    }
                });
            }
        }

        updateGridQuestion();

        btnPrevEl.disabled = qsNum === 0; // disable prev button if it's the first question

        if (qsNum === listQuestion.length - 1) {
            btnNextEl.innerText = 'Kết quả';
        } else {
            btnNextEl.innerText = 'Câu sau';
        }
    }

    const showResult = () => {
        showResultArea();
        const countCorrect = listQuestion.filter(
            (q) => q.result === RIGHT_ANSWER
        ).length;

        // calculate the score
        const score =
            Math.round(
                ((countCorrect / listQuestion.length) * 10 + Number.EPSILON) *
                    10
            ) / 10;

        // const questionContainer = document.getElementById('question-container');
        // questionContainer.innerHTML = ''; // clear the question container

        // const btnContainer = document.getElementById('btn-container');
        // btnContainer.innerHTML = ''; // clear the button container

        const resultContainer = document.getElementById('result-area');
        resultContainer.innerHTML = ''; // clear the result container

        // create result element
        const result = document.createElement('div');
        result.classList.add('result');
        result.innerText = score;
        resultContainer.appendChild(result);

        // create btn reset wrong element
        const btnResetWrongContainer = document.createElement('div');
        btnResetWrongContainer.classList.add('reset-wrong-container');
        const btnResetWrongEl = document.createElement('button');
        btnResetWrongEl.classList.add('btn-reset-wrong');
        btnResetWrongEl.innerText = 'Làm lại câu sai';
        btnResetWrongEl.addEventListener('click', () => {
            resetWrong();
            updateGridQuestion();
        });
        btnResetWrongContainer.appendChild(btnResetWrongEl);
        resultContainer.appendChild(btnResetWrongContainer);
    };

    // current question number
    let currentQuestionIndex = 0;

    // timeout for next question after 3 seconds since the user answered
    let nextTimeOut = null;

    // next question function
    function nextQuestion() {
        showQuestion(currentQuestionIndex + 1);
    }

    // prev question function
    function prevQuestion() {
        showQuestion(currentQuestionIndex - 1);
    }

    btnNextEl.addEventListener('click', nextQuestion); // add event listener to next button
    btnPrevEl.addEventListener('click', prevQuestion); // add event listener to prev button

    showQuestion(currentQuestionIndex); // show the first question

    const tabNavEls = document.getElementsByClassName('tab-link');
    const tabContentEls = document.getElementsByClassName('tab-content');

    for (let i = 0; i < tabNavEls.length; i++) {
        tabNavEls[i].addEventListener('click', function () {
            for (let j = 0; j < tabNavEls.length; j++) {
                tabNavEls[j].classList.remove('active');
                tabContentEls[j].classList.remove('active');
            }
            tabNavEls[i].classList.add('active');
            tabContentEls[i].classList.add('active');
        });
    }
});
