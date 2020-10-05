let tbody = document.querySelector('tbody');

/*****/

let DATA = get_data();
let CURR_TASK_SPACE = DATA;
update_table();

window.onunload = function () {
    set_data(DATA);
};

function get_data() {
    let data = localStorage.getItem("DATA");
    return data ? JSON.parse(data) : [];
}

function set_data(data) { // сохранение данных
    return;//Заглушка
    localStorage.setItem("DATA", JSON.stringify(data));
}

function update_table() {
    tbody.textContent = "";
    CURR_TASK_SPACE.forEach(item => {
        create_task(item.text, item.checked);
    });
}

function create_task(text, checked) {
    let tr = document.createElement('tr');
    tr.innerHTML = `
    <td>
      <input type="checkbox" class="checkbox qwe" ${checked ? "checked" : ""}>
    </td>

    <td class="name-list">
      <p class="p_input"><a href="#">${text}</a></p>
    </td>

    <td class="editing-list">
      <div class="editing">
        <img src="images/UpDown.png" alt="UpDown" class="trUp">
        <div class="vl"></div>

        <img src="images/pen.png" alt="editing" class="editing-name">
        <div class="vl"></div>

        <a href="#"><img src="images/basket.png" alt="basket" class="clear"></a>
      </div>
    </td>
  `;
    function clickListener(evt) {
        if (evt.target.className == "clear") {
            let tr = evt.currentTarget;
            tr.removeEventListener("click", clickListener);
            window.onunload = function () {
                localStorage.setItem("DATA", JSON.stringify(DATA));
            }

            DATA.splice(DATA.indexOf(text), 1);
            tr.parentElement.removeChild(tr);
        }
    };
    tr.addEventListener("click", clickListener);
    if (checked) tr.classList.add("done");
    tbody.appendChild(tr);
}

/*****/
// Функционал блокнота

onsubmit_add_task();
task_user_features();
sub_task_features();

function get_task_data(tr, remove) {
    let index = [].indexOf.call(tr.parentNode.children, tr);
    return remove ? CURR_TASK_SPACE.splice(index, 1)[0] : CURR_TASK_SPACE[index];
}

function onsubmit_add_task() {
    let form = document.querySelector('form');
    let input = document.getElementById('item');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let text = input.value;
        input.value = "";
        if (task_exists(text)) { window.alert("Такая задача уже была создана!"); return };
        create_task(text);
        CURR_TASK_SPACE.push({
            text: text,
            checked: false
        });
    });

    function task_exists(text) {
        return CURR_TASK_SPACE.some(task => task.text === text);
    }
}

// Кнопки функционала

function task_user_features() {
    tbody.addEventListener("change", function (e) {
        if (e.target.matches(".checkbox")) {
            let tr = e.target.closest("tr");
            toggle_checked(tr, e.target.checked);
        }
    });

    tbody.addEventListener("click", function (e) {
        let target = e.target;
        let tr = target.closest("tr");

        if (!tr) return;

        if (target.matches(".editing-name")) return task_edit_mode(tr);
        if (target.matches(".trUp")) return task_move_top(tr);
    });

    function task_edit_mode() {
        document.addEventListener(`click`, e => {
            if (e.target.classList.contains(`editing-name`)) {
                let paragraph = e.target.parentElement.parentElement.previousElementSibling.firstElementChild;
                let x = document.createElement('input');
                x.classList.add('NameCh');
                x.id = 'the_text_input_id';
                paragraph.innerHTML = ' ';
                paragraph.append(x);
                document.getElementById('the_text_input_id').focus()
                x.addEventListener('keydown', function (e) {
                    if (e.keyCode === 13) {
                        paragraph.innerHTML = x.value;
                    }
                });

            }

        });
    }
    function task_move_top(tr) {
        tbody.insertAdjacentElement("afterBegin", tr);
        let data = get_task_data(tr, "remove");
        CURR_TASK_SPACE.unshift(data);
    }
    function toggle_checked(tr, checked) {
        tr.classList.toggle("done", checked);
        get_task_data(tr).checked = checked;
    }
}

// Заголовок подзадач 

function sub_task_features() {
    let thead = document.querySelector("thead");

    entering_sub_task_mode();
    back_to_primary_tasks();

    /***/
    function entering_sub_task_mode() {
        let primary_task = document.querySelector("#selected-task-text");
        tbody.addEventListener("click", function (e) {
            let task_name = e.target.closest("td.name-list");
            if (!task_name) return;
            if (thead.matches(".sub-task-mode")) return;
            let edit_mode = task_name.querySelector("a[contentEditable]");
            if (edit_mode) return;
            /*** Входим в подзадачи */
            thead.classList.add("sub-task-mode");
            primary_task.textContent = task_name.textContent;
            let tr = task_name.parentNode;
            let data = get_task_data(tr);
            if (!data.sub) data.sub = [];
            CURR_TASK_SPACE = data.sub;
            update_table();
        });
    }

    function back_to_primary_tasks() {
        let back = document.querySelector("#back");
        back.addEventListener("click", function () {
            thead.classList.remove("sub-task-mode");
            CURR_TASK_SPACE = DATA;
            update_table();
        });
    }

}