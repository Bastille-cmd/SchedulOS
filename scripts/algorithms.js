function fcfs(processes) {
  processes.sort((a, b) => a.arrival - b.arrival);
  let time = 0, timeline = [];

  for (let p of processes) {
    if (time < p.arrival) time = p.arrival;
    let start = time;
    let end = time + p.burst;
    timeline.push({ pid: p.pid, start, end });
    time = end;
  }

  return timeline;
}

function sjf(processes) {
  let time = 0, timeline = [], completed = 0;
  const n = processes.length;
  const done = new Array(n).fill(false);

  while (completed < n) {
    let idx = -1, minBurst = Infinity;

    for (let i = 0; i < n; i++) {
      if (!done[i] && processes[i].arrival <= time && processes[i].burst < minBurst) {
        minBurst = processes[i].burst;
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    let start = time;
    let end = time + processes[idx].burst;
    timeline.push({ pid: processes[idx].pid, start, end });
    time = end;
    done[idx] = true;
    completed++;
  }

  return timeline;
}

function srtf(processes) {
  let time = 0, completed = 0, timeline = [], lastPid = -1;
  const n = processes.length;
  const remaining = processes.map(p => p.burst);
  const isDone = new Array(n).fill(false);

  while (completed < n) {
    let idx = -1;
    let minRemain = Infinity;

    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && remaining[i] < minRemain && remaining[i] > 0) {
        minRemain = remaining[i];
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    if (lastPid !== processes[idx].pid) {
      timeline.push({ pid: processes[idx].pid, start: time, end: time + 1 });
    } else {
      timeline[timeline.length - 1].end++;
    }

    remaining[idx]--;
    if (remaining[idx] === 0) {
      isDone[idx] = true;
      completed++;
    }

    time++;
    lastPid = processes[idx].pid;
  }

  return timeline;
}

function roundRobin(processes, quantum) {
  let queue = [];
  let time = 0, timeline = [];
  const remaining = processes.map(p => p.burst);
  const arrived = new Set();
  const n = processes.length;

  while (true) {
    // Add arrived processes to queue
    for (let i = 0; i < n; i++) {
      if (!arrived.has(i) && processes[i].arrival <= time) {
        queue.push(i);
        arrived.add(i);
      }
    }

    if (queue.length === 0) {
      if (arrived.size === n) break;
      time++;
      continue;
    }

    let idx = queue.shift();
    let execTime = Math.min(quantum, remaining[idx]);

    timeline.push({ pid: processes[idx].pid, start: time, end: time + execTime });
    time += execTime;
    remaining[idx] -= execTime;

    // Add newly arrived during this quantum
    for (let i = 0; i < n; i++) {
      if (!arrived.has(i) && processes[i].arrival <= time) {
        queue.push(i);
        arrived.add(i);
      }
    }

    if (remaining[idx] > 0) {
      queue.push(idx);
    }
  }

  return timeline;
}

function priorityScheduling(processes, preemptive = false) {
  let time = 0, completed = 0, timeline = [], lastPid = -1;
  const n = processes.length;
  const remaining = processes.map(p => p.burst);
  const isDone = new Array(n).fill(false);

  while (completed < n) {
    let idx = -1;
    let highest = Infinity;

    for (let i = 0; i < n; i++) {
      if (!isDone[i] && processes[i].arrival <= time && processes[i].priority < highest && remaining[i] > 0) {
        highest = processes[i].priority;
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    if (preemptive) {
      if (lastPid !== processes[idx].pid) {
        timeline.push({ pid: processes[idx].pid, start: time, end: time + 1 });
      } else {
        timeline[timeline.length - 1].end++;
      }

      remaining[idx]--;
      if (remaining[idx] === 0) {
        isDone[idx] = true;
        completed++;
      }

      lastPid = processes[idx].pid;
      time++;
    } else {
      let start = time;
      let end = time + remaining[idx];
      timeline.push({ pid: processes[idx].pid, start, end });
      time = end;
      isDone[idx] = true;
      completed++;
    }
  }

  return timeline;
}
