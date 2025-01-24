// Global tasks array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Add new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dateTimePicker = document.getElementById('dateTimePicker');
    
    // Validate input
    if (taskInput.value.trim() === '') {
        alert('Please enter a task!');
        return;
    }

    if (dateTimePicker.value === '') {
        alert('Please select a date and time!');
        return;
    }

    // Create new task object
    const task = {
        id: Date.now(),
        text: taskInput.value.trim(),
        completed: false,
        datetime: dateTimePicker.value,
        reminded: false
    };

    // Add task and update UI
    tasks.push(task);
    saveTasks();
    renderTasks();
    
    // Clear inputs
    taskInput.value = '';
    dateTimePicker.value = '';

    // Mobile keyboard handling
    taskInput.blur();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filter tasks
function filterTasks(filter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');

    const taskList = document.getElementById('taskList');
    taskList.className = filter;
    renderTasks();
}

// Render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const filter = taskList.className || 'all';
    
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        if (
            filter === 'all' || 
            (filter === 'completed' && task.completed) || 
            (filter === 'pending' && !task.completed)
        ) {
            const taskDate = new Date(task.datetime);
            const now = new Date();
            const isOverdue = !task.completed && taskDate < now;

            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                        onclick="toggleTask(${task.id})">
                    <div class="task-details">
                        <span class="task-text">${task.text}</span>
                        <span class="task-date ${isOverdue ? 'task-overdue' : ''}">
                            <i class="far fa-calendar-alt"></i>
                            ${taskDate.toLocaleString()}
                            ${isOverdue ? ' (Overdue!)' : ''}
                        </span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            taskList.appendChild(li);

            // Show reminder for overdue tasks
            if (isOverdue && !task.reminded) {
                task.reminded = true;
                showReminder(task);
            }
        }
    });
}

// Show notifications
function showReminder(task) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Overdue!', {
            body: `The task "${task.text}" is overdue!`,
            icon: 'favicon.ico'
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Initial render
    renderTasks();

    // Check for overdue tasks every minute
    setInterval(renderTasks, 60000);
});