import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// return a list of 12 random letters, with at least four vowels
function getRandomLetters() {
  let alphabet = 'ABCDEFGHIJKLMNOPRSTUVWXYZ'.split('')
  let vowels = 'AEIOU'.split('')
  let letters = []
  for (let i=0; i<12; i+=1) {
    let j = Math.floor(Math.random() * alphabet.length)
    letters.push(alphabet[j])
    alphabet.splice(j, 1)
  }
  let vowel_count = 0
  letters.forEach(x => vowel_count += vowels.includes(x) ? 1 : 0)
  if (vowel_count < 4) {
    return getRandomLetters()
  }
  return letters
}

const letters = getRandomLetters()

ReactDOM.render(<Main letters={letters} />, document.getElementById('root'))

function BoardRegion(props) {
  const { height, width } = props

  const fullPageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffafa3',
  }

  const outerContainerStyle = {
    flexWrap: 'wrap',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: `${width}px`,
    height: `${height}px`,
  }

  return (
    <div style={fullPageStyle}>
      <div style={outerContainerStyle}>
        {props.children} 
      </div>
    </div>
  )
}

function LetterDisplay(props) {
  let { letter, x, y } = props
  const [style, setStyle] = useState()
  const ref = useRef()
  useEffect(() => {
    setStyle({
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      display: 'inline',
      margin: 'none',
      transform: 'translate(-50%, -50%)',
    })
  }, [])
  return <div ref={ref} style={style}>{letter}</div>
}

function getClickHandler(c, r, setProgress) {}

function Board(props) {
  const [progress, setProgress] = useState([[]])
  const [letters, setLetters] = useState(props.letters)
  const rect = <rect
                 x='50'
                 y='50'
                 width='200'
                 height='200'
                 stroke='black'
                 strokeWidth='2'
                 fill='white'
               />

  const centers = [[50, 100], [50, 150], [50, 200],
                   [100, 50], [150, 50], [200, 50],
                   [100, 250], [150, 250], [200, 250],
                   [250, 100], [250, 150], [250, 200]]
  const r = 50 / 6
  const circles = centers.map((c, i) => (
    <circle
    cx={String(c[0])}
    cy={String(c[1])}
    r={r}
    stroke='black'
    strokeWidth='2'
    fill={inProgress(i) ? 'black' : 'white'}
    key={i}
    onClick={getClickHandler(i)}
    />
  ))

  function getProgressString() {
    let s = ''
    progress.forEach((x, i) => {
      x.forEach(y => {s += letters[y]})
      if (i != progress.length - 1) {
        s += '-'
      }
    })
    return s
  }

  function getClickHandler(i) {
    return () => {
      if (checkClick(i)) {
        setLetters([...letters])
        progress.slice(-1)[0].push(i)
      }
    }
  }

  function checkClick(i) {
    if (progress.slice(-1)[0].length == 0) { return true }
    const prev = progress.slice(-1)[0].slice(-1)[0]
    const positions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]
    let bad = false
    positions.forEach(x => {
      bad = bad || (x.includes(prev) && x.includes(i))
    })
    return !bad
  }

  function inProgress(i) {
    let member = false
    progress.forEach(x => {
      member = member || x.includes(i)
    })
    return member
  }


  const letterDisplays = letters.map((l, i) => {
    let x, y
    if ([0, 1, 2].includes(i)) {
      x = centers[i][0] - 25
      y = centers[i][1]
    } else if ([3, 4, 5].includes(i)) {
      x = centers[i][0]
      y = centers[i][1] - 25
    } else if ([6, 7, 8].includes(i)) {
      x = centers[i][0]
      y = centers[i][1] + 25
    } else {
      x = centers[i][0] + 25
      y = centers[i][1]
    }
    return <LetterDisplay x={x} y={y} letter={l} key={i} />
  })
  
  function newWord() {
    const recent = progress.slice(-1)[0]
    if (recent.length === 0) {
      return
    }
    const lastLetter = recent.slice(-1)[0]
    progress.push([lastLetter])
    setProgress([...progress])
  }

  function undo() {
    const recent = progress.slice(-1)[0]

    // initial situation of no words
    if (recent.length === 0 && progress.length === 1) { return }

    // exactly 1 letter in initial word
    if (recent.length === 1 && progress.length === 1) { recent.pop() }

    // new letter created as default first of new word
    // there cannot be a situation where recent.length === 0
    if (recent.length === 1 && progress.length > 1) { progress.pop() }

    // otherwise the only situation left is when there is more than 1 letter
    // in the most recent word
    if (recent.length > 1) { recent.pop() }

    setProgress([...progress])
  }

  function keyListener(e) {
    if (e.keyCode === 13) { newWord() }
    if (e.keyCode === 8) { undo() }
  }

  useEffect(() => {
    document.addEventListener('keydown', keyListener)
  }, [])

  return (
    <div>
      {getProgressString()}
      <div style={{'position': 'relative'}}>
        <svg height='300' width='300'>
          {rect}
          {circles}
        </svg>   
      {letterDisplays}
      </div>
    </div>
  )
}


function Main(props) {
  const { letters } = props
  return (
    <BoardRegion height={300} width={300}>
      <Board letters={letters} />
    </BoardRegion>
  )
}
