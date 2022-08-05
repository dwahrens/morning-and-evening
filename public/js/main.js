let keyverse = document.querySelector('#entryKeyverse')
let body = document.querySelector('#entryBody')
let title = document.querySelector('#title')
let mOE = document.querySelector('#morningOrEvening')
let now = new Date()
let day = now.getDate()
let month = now.getMonth() + 1
let year = now.getFullYear()
let time = ''
document.addEventListener('DOMContentLoaded', () => {
  time = getTime()
  title.innerHTML = getTitle()
  mOE.innerHTML = getMorningOrEvening()
  fetchData()
}, false)
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js')
}
let selectDate = (e) => {
  let d = e.target.value.split('-')
  now = new Date(d[1] + '/' + d[2] + '/' + d[0])
  day = now.getDate()
  month = now.getMonth() + 1
  year = now.getFullYear()
  title.innerHTML = getTitle()
  if (navigator.onLine) {
    fetchData()
  } else {
    fetchData()
  }
}
let fetchData = () => {
  let getString = '/me/' + month + '/' + day + '/' + time
  let myRequest = new Request(getString)
  fetch(myRequest)
    .then((response) => { return response.json() })
    .then((data) => {
      keyverse.innerHTML = data.keyverse
      body.innerHTML = data.body
    }).catch(error => { error = error })
}
let getTitle = () => {
  var options = { weekday: 'long', month: 'long', day: 'numeric' }
  return new Date(year, month-1, day).toLocaleString('default', options)
}
let getMorningOrEvening = () => {
  return (time === 'pm') ? 'Evening' : 'Morning'
}
let previous = () => {
  if (time === 'am') {
    time = 'pm'
    // if day is not last day of the month increment the day
    if (new Date(now.getTime()).getDate() === 1) {
      month--
      now = new Date(year, month, 0)
      day = now.getDate()
      fetchData()
    } else {
      day--          
      fetchData()
    }
  } else {
    time='am'
    // change the time to pm and get the latest
    fetchData()
  }
  title.innerHTML = getTitle()
  mOE.innerHTML = getMorningOrEvening()
}
let next = () => {
  // Check if the time is am or pm
  if (time === 'pm') {
    time = 'am'
    // if day is not last day of the month increment the day
    if (day === new Date(year, month, 0).getDate()) {
      month++
      day = 1
      fetchData()
    } else {
      day++
      fetchData()
    }
  } else {
    // change the time to pm and get the latest
    time = 'pm'
    fetchData()
  }
  title.innerHTML = getTitle()
  mOE.innerHTML = getMorningOrEvening()
}
let getTime = () => {
  var hours = now.getHours()
  var ampm = (hours >= 12) ? 'pm' : 'am'
  return ampm
}
let getIDB = async (dname, sname, key) => {
  return new Promise((resolve) => {
    var r = indexedDB.open(dname)
    r.onsuccess = (e) => {
      var idb = r.result
      let tactn = idb.transaction(sname, "readonly")
      let store = tactn.objectStore(sname)
      let data = store.get(key)
      data.onsuccess = () => {
        resolve(data.result)
      }
      tactn.oncomplete = () => {
        idb.close()
      }
    }
    r.onerror = (e) => {
      fetchData()
    }
  })
}
let checkIDB = async (dbname) => {
  return new Promise((resolve) => {
    var req = indexedDB.open(dbname)
    var existed = true
    req.onsuccess = () => {
      req.result.close()
      if (!existed) indexedDB.deleteDatabase(dbname)
    }
    req.onupgradeneeded = () => {
      existed = false
    }
    resolve(existed)
  })
}