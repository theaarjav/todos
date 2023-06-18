let allFilters = document.querySelectorAll(".filter")
let openModal = document.querySelector(".open-modal");
let closeModal = document.querySelector(".close-modal");
let allFilterscolors = ["red", "blue", "cyan", "black", "green"]
let myDB = window.localStorage
let ticketContainer = document.querySelector(".tickets-container");
let ticketModalOpen = false;
let isTextPresent = false;



const selectFilter = (e) => {
    if (e.target.classList.contains("active-filter")) {
        e.target.classList.remove("active-filter");
        ticketContainer.innerHTML = "";
        loadTickets();
    }
    else {
        let curr = document.querySelector(".active-filter");
        if (curr !== null) curr.classList.remove("active-filter");
        e.target.classList.add("active-filter");
        loadSelectedFilter(e.target.classList[1]);

    }
}
function loadSelectedFilter(color) {
    ticketContainer.innerHTML = "";
    let allTickets = JSON.parse(myDB.getItem("allTickets"));
    for (const ticket of allTickets) {
        console.log(ticket);
        if (ticket.ticketfilter === color) {
            console.log("Colour matched")
            appendTicket(ticket);
        }
    }

}
for (const filter of allFilters) {
    filter.addEventListener("click", selectFilter);
}

openModal.addEventListener("click", openTicketModal);
closeModal.addEventListener("click", closeTicketModal);

function loadTickets() {

    let allTickets = localStorage.getItem("allTickets");
    // console.log(allTickets);
    if (allTickets) {
        allTickets = JSON.parse(allTickets);
        for (let i = 0; i < allTickets.length; i++) {
            let ticketObj = allTickets[i];
            appendTicket(ticketObj);
        }
    }
}

loadTickets();
function openTicketModal(e) {
    if (ticketModalOpen) return;
    let ticketModal = document.createElement("div");
    ticketModal.classList.add("ticket-modal");
    ticketModal.innerHTML = `
    <div  class="ticket-text" contenteditable="true">
        Enter your text
    </div>
    <div class="choose-priority">
        <div class="choose-filter red"></div>
        <div class="choose-filter blue"></div>
        <div class="choose-filter cyan"></div>
        <div class="choose-filter black"></div>
        <div class="choose-filter green"></div>
    </div>
    `
    document.querySelector("body").append(ticketModal)
    ticketModalOpen = true;
    isTextPresent = false;
    let ticketTextDiv = ticketModal.querySelector(".ticket-text")
    ticketTextDiv.addEventListener("keypress", handleKeyPress);

    let chooseFilter = document.querySelectorAll(".choose-filter")
    for (let i = 0; i < chooseFilter.length; i++) {
        chooseFilter[i].addEventListener("click", function (e) {
            if (e.target.classList.contains("active-filter")) { return; }
            let activecolour = document.querySelector(".active-filter");
            if (activecolour) activecolour.classList.remove("active-filter");
            e.target.classList.add("active-filter");
            return;
        })
    }

}

function handleKeyPress(e) {
    if (e.key === "Enter" && isTextPresent && e.target.textContent) {
        let ticketId=uuid();
        let filterSelected = document.querySelector(".active-filter").classList[1];
        let ticketInfoObject = {
            ticketfilter: filterSelected,
            ticketValue: e.target.textContent,
            ticketId: ticketId
        };
        appendTicket(ticketInfoObject);
        closeModal.click();
        saveTicketToDb(ticketInfoObject)
    }
    if (!isTextPresent) {
        console.log("Keypress");
        isTextPresent = true;
        e.target.textContent = "";
    }
}
function saveTicketToDb(ticketInfoObject) {
    let allTickets = myDB.getItem("allTickets");
    if (allTickets === null) {
        allTickets = [{ ticketInfoObject }];
        myDB.setItem("allTickets", JSON.stringify(allTickets));
    } else {
        allTickets = JSON.parse(allTickets);
        allTickets.push(ticketInfoObject);
        myDB.setItem("allTickets", JSON.stringify(allTickets));
    }
}

function appendTicket(ticketInfoObject) {
    let { ticketfilter, ticketValue, ticketId } = ticketInfoObject;
    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add("ticket");
    ticketDiv.innerHTML = `
    <div class="ticket-header ${ticketfilter}">

            </div>
            <div class="ticket-content">
                <div class="ticket-info">
                    <div class="ticket-id">${ticketId}</div>
                    <div class="icons">
                        <span class="ticket-edit"><i class="fa-regular fa-pen-to-square"></i></span>
                        <span class="ticket-delete"><i class="fa-sharp fa-solid fa-trash"></i></span>
                    </div>
                </div>

                <div class="ticket-desc">${ticketValue}</div>
            </div>
    `
    let ticketHeader = ticketDiv.getElementsByClassName("ticket-header")[0];
    if (ticketHeader) {
        ticketHeader.addEventListener("click", function (e) {
            let currFilter = e.target.classList[1];
            let indOfcurr = allFilterscolors.indexOf(currFilter);
            let col = allFilterscolors[(indOfcurr + 1) % allFilterscolors.length];
            ticketHeader.classList.remove(currFilter);
            ticketHeader.classList.add(col)
            let allTickets = JSON.parse(myDB.getItem("allTickets"));
            if (allTickets)
                for (let i = 0; i < allTickets.length; i++) {
                    if (allTickets[i].ticketId == ticketId) {
                        allTickets[i].ticketfilter = col;
                    }
                }
            myDB.setItem("allTickets", JSON.stringify(allTickets));
        })
    }

    let deleteBtn = ticketDiv.querySelector(".ticket-delete");
    deleteBtn.addEventListener("click", function (e) {
        ticketDiv.remove();
        let allTickets = JSON.parse(myDB.getItem("allTickets"));

        myDB.setItem("allTickets", JSON.stringify(allTickets.filter(function (obj) { return obj.ticketId != ticketId; })));
    })
    let editBtn = ticketDiv.querySelector(".ticket-edit");
    editBtn.addEventListener("click",  (e)=>{
        console.log(ticketDiv);
        editTicketModal(ticketInfoObject);
    })
    ticketContainer.append(ticketDiv)

}

function editTicketModal(ticket){
    let { ticketfilter, ticketValue, ticketId } = ticket;
    if (ticketModalOpen) return;
    let ticketModal = document.createElement("div");
    ticketModal.classList.add("ticket-modal");
    ticketModal.innerHTML = `
    <div  class="ticket-text" contenteditable="true">
        ${ticketValue}
    </div>
    <div class="choose-priority">
        <div class="choose-filter red ${ticketfilter==="red"?"active-filter":""}"></div>
        <div class="choose-filter blue ${ticketfilter==="blue"?"active-filter":""}"></div>
        <div class="choose-filter cyan ${ticketfilter==="cyan"?"active-filter":""}"></div>
        <div class="choose-filter black ${ticketfilter==="black"?"active-filter":""}"></div>
        <div class="choose-filter green ${ticketfilter==="green"?"active-filter":""}"></div>
    </div>
    `
    document.querySelector("body").append(ticketModal)
    ticketModalOpen = true;
    let ticketTextDiv = ticketModal.querySelector(".ticket-text")
    
    let chooseFilter = document.querySelectorAll(".choose-filter")
    for (let i = 0; i < chooseFilter.length; i++) {
        chooseFilter[i].addEventListener("click", function (e) {
            if (e.target.classList.contains("active-filter")) { return; }
            let activecolour = document.querySelector(".active-filter");
            if (activecolour){
                activecolour.classList.remove("active-filter");
            }
            e.target.classList.add("active-filter");
            return;
        })
    }
    ticketTextDiv.addEventListener("keypress", handleEditKeyPress);

    
    function handleEditKeyPress( e) {
        if (e.key === "Enter"  && e.target.textContent) {
            console.log(ticketId);
            let allTickets=JSON.parse(myDB.getItem("allTickets"));
            for (const ticket of allTickets) {
                // if(ticket[ticketId])
                if(ticket.ticketId===ticketId){
                    ticket.ticketValue=e.target.textContent;
                    ticket.ticketfilter=document.querySelector(".active-filter").classList[1];
                    console.log(ticketfilter)
                    closeModal.click();
                    break;
                }
            }
            myDB.setItem("allTickets", JSON.stringify(allTickets));
            ticketContainer.innerHTML="";
            loadTickets();

        }
        }
}
closeModal.addEventListener("click", closeTicketModal);

function closeTicketModal(e) {
    if (!ticketModalOpen) return;
    document.querySelector(".ticket-modal").remove();
    ticketModalOpen = false;

}

