var teamMembers = [];
var selectedMemberIndex = null;

fetch("./datasets/settings.json")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        teamMembers = data.members;

        loadTeamMembers(teamMembers);
        loadSettingsFromJson(data.general, data.notifications);
        loadSavedSettings();

        if (teamMembers.length > 0) {
            loadAccountInfo(teamMembers[0], 0);
        }

        showTab("team");
    });

function showTab(tabName) {
    var tabButtons = document.querySelectorAll(".tab-btn");
    var tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(function(btn) {
        btn.classList.remove("active");

        if (btn.dataset.tab === tabName) {
            btn.classList.add("active");
        }
    });

    tabContents.forEach(function(tab) {
        tab.classList.remove("active-tab");
    });

    document.getElementById(tabName + "-tab").classList.add("active-tab");
}

document.querySelectorAll(".tab-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        showTab(this.dataset.tab);
    });
});

function loadTeamMembers(members) {
    var tbody = document.getElementById("teamBody");
    var totalMembers = document.getElementById("totalMembers");

    totalMembers.innerHTML = members.length + " Total";
    tbody.innerHTML = "";

    members.forEach(function(member, index) {
        var row = document.createElement("tr");
        row.className = "member-row";
        row.dataset.index = index;

        row.innerHTML =
            "<td>" +
                "<div class='member-info'>" +
                    "<img class='team-avatar' src='" + member.avatar + "' alt='" + member.name + "'>" +
                    "<div>" +
                        "<h4>" + member.name + "</h4>" +
                        "<p>" + member.username + "</p>" +
                    "</div>" +
                "</div>" +
            "</td>" +
            "<td><span class='member-status " + member.status.toLowerCase() + "'>" + member.status + "</span></td>" +
            "<td>" + member.joinDate + "</td>" +
            "<td>" + member.lastActive + "</td>" +
            "<td>" + member.role + "</td>" +
            "<td><button class='delete-btn'><i class='fa-regular fa-trash-can'></i></button></td>";

        row.addEventListener("click", function(event) {
            if (event.target.closest(".delete-btn")) {
                teamMembers.splice(index, 1);
                loadTeamMembers(teamMembers);

                if (teamMembers.length > 0) {
                    loadAccountInfo(teamMembers[0], 0);
                }

                return;
            }

            loadAccountInfo(member, index);
            showTab("account");
        });

        tbody.appendChild(row);
    });
}

function loadAccountInfo(member, index) {
    selectedMemberIndex = index;

    document.getElementById("accountAvatar").src = member.avatar;
    document.getElementById("accountName").innerHTML = member.name;
    document.getElementById("accountRoleText").innerHTML = member.role;

    document.getElementById("accountFullName").value = member.name;
    document.getElementById("accountUsername").value = member.username;
    document.getElementById("accountStatus").value = member.status;
    document.getElementById("accountRole").value = member.role;
    document.getElementById("accountJoinDate").value = member.joinDate;
    document.getElementById("accountLastActive").value = member.lastActive;
}

document.getElementById("updateAccountBtn").addEventListener("click", function() {
    if (selectedMemberIndex === null) {
        alert("Please choose a team member first.");
        return;
    }

    teamMembers[selectedMemberIndex].name =
        document.getElementById("accountFullName").value;

    teamMembers[selectedMemberIndex].username =
        document.getElementById("accountUsername").value;

    teamMembers[selectedMemberIndex].role =
        document.getElementById("accountRole").value;

    teamMembers[selectedMemberIndex].joinDate =
        document.getElementById("accountJoinDate").value;

    teamMembers[selectedMemberIndex].lastActive =
        document.getElementById("accountLastActive").value;

    /*
        Không update status ở đây.
        Status được xem là dữ liệu do hệ thống tự cập nhật.
    */

    loadTeamMembers(teamMembers);
    loadAccountInfo(teamMembers[selectedMemberIndex], selectedMemberIndex);

    alert("Account updated successfully!");
});

function loadSettingsFromJson(general, notifications) {
    document.getElementById("websiteName").value = general.websiteName;
    document.getElementById("websiteDescription").value = general.description;
    document.getElementById("language").value = general.language;
    document.getElementById("timezone").value = general.timezone;
    document.getElementById("theme").value = general.theme;
    document.getElementById("systemStatus").value = general.status;

    document.getElementById("emailNotification").checked = notifications.email;
    document.getElementById("orderNotification").checked = notifications.order;
    document.getElementById("reviewNotification").checked = notifications.review;
    document.getElementById("loginAlert").checked = notifications.loginAlert;
}

function loadSavedSettings() {
    var savedSettings = localStorage.getItem("mycogenSettings");

    if (!savedSettings) {
        return;
    }

    savedSettings = JSON.parse(savedSettings);

    document.getElementById("websiteName").value = savedSettings.websiteName;
    document.getElementById("websiteDescription").value = savedSettings.description;
    document.getElementById("language").value = savedSettings.language;
    document.getElementById("timezone").value = savedSettings.timezone;
    document.getElementById("theme").value = savedSettings.theme;
    document.getElementById("systemStatus").value = savedSettings.status;

    document.getElementById("emailNotification").checked = savedSettings.emailNotification;
    document.getElementById("orderNotification").checked = savedSettings.orderNotification;
    document.getElementById("reviewNotification").checked = savedSettings.reviewNotification;
    document.getElementById("loginAlert").checked = savedSettings.loginAlert;
}

document.getElementById("saveSettingsBtn").addEventListener("click", function() {
    var settingsData = {
        websiteName: document.getElementById("websiteName").value,
        description: document.getElementById("websiteDescription").value,
        language: document.getElementById("language").value,
        timezone: document.getElementById("timezone").value,
        theme: document.getElementById("theme").value,
        status: document.getElementById("systemStatus").value,
        emailNotification: document.getElementById("emailNotification").checked,
        orderNotification: document.getElementById("orderNotification").checked,
        reviewNotification: document.getElementById("reviewNotification").checked,
        loginAlert: document.getElementById("loginAlert").checked
    };

    localStorage.setItem("mycogenSettings", JSON.stringify(settingsData));

    alert("Settings saved successfully!");
});

var modal = document.getElementById("addUserModal");

document.getElementById("openAddUserModal").addEventListener("click", function() {
    modal.classList.add("show-modal");
});

document.getElementById("closeAddUserModal").addEventListener("click", function() {
    modal.classList.remove("show-modal");
});

document.getElementById("cancelAddUser").addEventListener("click", function() {
    modal.classList.remove("show-modal");
});

document.getElementById("addUserForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var name = document.getElementById("newName").value;
    var username = document.getElementById("newUsername").value;
    var status = document.getElementById("newStatus").value;
    var role = document.getElementById("newRole").value;

    var newMember = {
        name: name,
        username: username,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=" + encodeURIComponent(name),
        status: status,
        joinDate: "June 24, 2026",
        lastActive: "Just now",
        role: role
    };

    teamMembers.push(newMember);

    loadTeamMembers(teamMembers);
    loadAccountInfo(newMember, teamMembers.length - 1);
    showTab("account");

    this.reset();
    modal.classList.remove("show-modal");
});

document.getElementById("exportBtn").addEventListener("click", function() {
    var csv = "Full Name,Username,Status,Join Date,Last Active,Role\n";

    teamMembers.forEach(function(member) {
        csv += member.name + "," +
            member.username + "," +
            member.status + "," +
            member.joinDate + "," +
            member.lastActive + "," +
            member.role + "\n";
    });

    var blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "team-members.csv";
    link.click();
});