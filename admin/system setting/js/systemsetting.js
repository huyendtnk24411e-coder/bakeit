var teamMembers = [];
var selectedMemberIndex = null;
var currentUser = "@samsam";

var dataPath = window.location.pathname.includes("myprofile")
    ? "../system setting/datasets/settings.json"
    : "./datasets/settings.json";

fetch(dataPath)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        teamMembers = data.members || [];
        currentUser = data.currentUser || "@samsam";

        renderSidebarProfile(teamMembers);
        setupCommonEvents();
        applySavedTheme();

        if (document.getElementById("teamBody")) {
            loadTeamMembers(teamMembers);
            loadSettingsFromJson(data.general, data.notifications);
            loadSavedSettings();
            setupSystemSettingEvents();
            showTab("team");
        }

        if (document.getElementById("profileName")) {
            renderMyProfilePage(teamMembers);
        }
    })
    .catch(function(error) {
        console.error("Cannot load settings.json:", error);
    });

function getCurrentProfile(members) {
    return members.find(function(member) {
        return member.username === currentUser;
    }) || members[0];
}

function renderSidebarProfile(members) {
    var currentProfile = getCurrentProfile(members);
    if (!currentProfile) return;

    var sidebarAvatar = document.getElementById("sidebarAvatar");
    var sidebarName = document.getElementById("sidebarName");
    var sidebarRole = document.getElementById("sidebarRole");

    if (sidebarAvatar) sidebarAvatar.src = currentProfile.avatar;
    if (sidebarName) sidebarName.innerHTML = currentProfile.name;
    if (sidebarRole) sidebarRole.innerHTML = currentProfile.role;
}

function setupCommonEvents() {
    var sidebarProfileCard = document.getElementById("sidebarProfileCard");
    var profileArrow = document.getElementById("profileArrow");
    var profileMenu = document.getElementById("profileMenu");
    var logoutBtn = document.getElementById("logoutBtn");
    var notificationBtn = document.getElementById("notificationBtn");
    var notificationPanel = document.getElementById("notificationPanel");

    if (sidebarProfileCard) {
        sidebarProfileCard.addEventListener("click", function(event) {
            if (event.target.id === "profileArrow" || event.target.closest("#profileMenu")) {
                return;
            }

            var currentProfile = getCurrentProfile(teamMembers);
            if (!currentProfile) return;

            window.location.href =
                "../myprofile/myprofile.html?user=" +
                encodeURIComponent(currentProfile.username);
        });
    }

    if (profileArrow && profileMenu) {
        profileArrow.addEventListener("click", function(event) {
            event.stopPropagation();
            profileMenu.classList.toggle("show-profile-menu");
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.stopPropagation();
            alert("Logged out successfully!");
        });
    }

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener("click", function(event) {
            event.stopPropagation();

            if (event.target.closest("#notificationPanel")) {
                return;
            }

            notificationPanel.classList.toggle("show");
        });

        notificationPanel.addEventListener("click", function(event) {
            event.stopPropagation();
        });
    }

    document.addEventListener("click", function() {
        if (notificationPanel) notificationPanel.classList.remove("show");
        if (profileMenu) profileMenu.classList.remove("show-profile-menu");
    });
}

function showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(function(btn) {
        btn.classList.remove("active");
        if (btn.dataset.tab === tabName) btn.classList.add("active");
    });

    document.querySelectorAll(".tab-content").forEach(function(tab) {
        tab.classList.remove("active-tab");
    });

    var target = document.getElementById(tabName + "-tab");
    if (target) target.classList.add("active-tab");
}

document.querySelectorAll(".tab-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        showTab(this.dataset.tab);
    });
});

function loadTeamMembers(members) {
    var tbody = document.getElementById("teamBody");
    var totalMembers = document.getElementById("totalMembers");
    if (!tbody || !totalMembers) return;

    totalMembers.innerHTML = members.length + " Total";
    tbody.innerHTML = "";

    members.forEach(function(member, index) {
        var row = document.createElement("tr");
        row.className = "member-row";

        row.innerHTML =
            "<td><div class='member-info'>" +
            "<img class='team-avatar' src='" + member.avatar + "' alt='" + member.name + "'>" +
            "<div><h4>" + member.name + "</h4><p>" + member.username + "</p></div>" +
            "</div></td>" +
            "<td><span class='member-status " + member.status.toLowerCase() + "'>" + member.status + "</span></td>" +
            "<td>" + member.joinDate + "</td>" +
            "<td>" + member.lastActive + "</td>" +
            "<td>" + member.role + "</td>" +
            "<td><button class='delete-btn'><i class='fa-regular fa-trash-can'></i></button></td>";

        row.addEventListener("click", function(event) {
            if (event.target.closest(".delete-btn")) {
                var realIndex = teamMembers.indexOf(member);
                if (realIndex >= 0) teamMembers.splice(realIndex, 1);
                loadTeamMembers(teamMembers);
                if (teamMembers.length > 0) loadAccountInfo(teamMembers[0], 0);
                return;
            }

            var realIndex = teamMembers.indexOf(member);
            loadAccountInfo(member, realIndex);
            showTab("account");
        });

        tbody.appendChild(row);
    });

    if (members.length > 0) {
        var realIndex = teamMembers.indexOf(members[0]);
        loadAccountInfo(members[0], realIndex);
    }
}

function loadAccountInfo(member, index) {
    selectedMemberIndex = index;

    setValue("accountAvatar", member.avatar, "src");
    setValue("accountName", member.name);
    setValue("accountRoleText", member.role);
    setValue("accountFullName", member.name, "value");
    setValue("accountUsername", member.username, "value");
    setValue("accountStatus", member.status, "value");
    setValue("accountRole", member.role, "value");
    setValue("accountJoinDate", member.joinDate, "value");
    setValue("accountLastActive", member.lastActive, "value");
}

function setValue(id, value, prop) {
    var el = document.getElementById(id);
    if (!el) return;
    if (prop === "src") el.src = value;
    else if (prop === "value") el.value = value;
    else el.innerHTML = value;
}

function setupSystemSettingEvents() {
    var updateAccountBtn = document.getElementById("updateAccountBtn");
    var saveSettingsBtn = document.getElementById("saveSettingsBtn");
    var openAddUserModal = document.getElementById("openAddUserModal");
    var closeAddUserModal = document.getElementById("closeAddUserModal");
    var cancelAddUser = document.getElementById("cancelAddUser");
    var addUserForm = document.getElementById("addUserForm");
    var exportBtn = document.getElementById("exportBtn");
    var teamSearchInput = document.getElementById("teamSearchInput");

    if (updateAccountBtn) {
        updateAccountBtn.addEventListener("click", function() {
            if (selectedMemberIndex === null || selectedMemberIndex < 0) return;

            teamMembers[selectedMemberIndex].name = document.getElementById("accountFullName").value;
            teamMembers[selectedMemberIndex].username = document.getElementById("accountUsername").value;
            teamMembers[selectedMemberIndex].role = document.getElementById("accountRole").value;
            teamMembers[selectedMemberIndex].joinDate = document.getElementById("accountJoinDate").value;
            teamMembers[selectedMemberIndex].lastActive = document.getElementById("accountLastActive").value;

            loadTeamMembers(teamMembers);
            loadAccountInfo(teamMembers[selectedMemberIndex], selectedMemberIndex);
            alert("Account updated successfully!");
        });
    }

    if (saveSettingsBtn) saveSettingsBtn.addEventListener("click", saveSettings);
    if (openAddUserModal) openAddUserModal.addEventListener("click", openModal);
    if (closeAddUserModal) closeAddUserModal.addEventListener("click", closeModal);
    if (cancelAddUser) cancelAddUser.addEventListener("click", closeModal);
    if (addUserForm) addUserForm.addEventListener("submit", addNewUser);
    if (exportBtn) exportBtn.addEventListener("click", exportCSV);

    if (teamSearchInput) {
        teamSearchInput.addEventListener("input", function() {
            var keyword = this.value.toLowerCase();
            var filtered = teamMembers.filter(function(member) {
                return member.name.toLowerCase().includes(keyword) ||
                       member.username.toLowerCase().includes(keyword) ||
                       member.role.toLowerCase().includes(keyword);
            });
            loadTeamMembers(filtered);
        });
    }
}

function loadSettingsFromJson(general, notifications) {
    setValue("websiteName", general.websiteName, "value");
    setValue("websiteDescription", general.description, "value");
    setValue("language", general.language, "value");
    setValue("timezone", general.timezone, "value");
    setValue("theme", general.theme, "value");
    setValue("systemStatus", general.status, "value");

    var emailNotification = document.getElementById("emailNotification");
    var orderNotification = document.getElementById("orderNotification");
    var reviewNotification = document.getElementById("reviewNotification");
    var loginAlert = document.getElementById("loginAlert");

    if (emailNotification) emailNotification.checked = notifications.email;
    if (orderNotification) orderNotification.checked = notifications.order;
    if (reviewNotification) reviewNotification.checked = notifications.review;
    if (loginAlert) loginAlert.checked = notifications.loginAlert;
}

function loadSavedSettings() {
    var saved = localStorage.getItem("mycogenSettings");
    if (!saved) return;

    var data = JSON.parse(saved);

    setValue("websiteName", data.websiteName, "value");
    setValue("websiteDescription", data.description, "value");
    setValue("language", data.language, "value");
    setValue("timezone", data.timezone, "value");
    setValue("theme", data.theme, "value");
    setValue("systemStatus", data.status, "value");

    var emailNotification = document.getElementById("emailNotification");
    var orderNotification = document.getElementById("orderNotification");
    var reviewNotification = document.getElementById("reviewNotification");
    var loginAlert = document.getElementById("loginAlert");

    if (emailNotification) emailNotification.checked = data.emailNotification;
    if (orderNotification) orderNotification.checked = data.orderNotification;
    if (reviewNotification) reviewNotification.checked = data.reviewNotification;
    if (loginAlert) loginAlert.checked = data.loginAlert;

    applyTheme(data.theme);
}

function saveSettings() {
    var data = {
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

    localStorage.setItem("mycogenSettings", JSON.stringify(data));
    applyTheme(data.theme);
    alert("Settings saved successfully!");
}

function applySavedTheme() {
    var saved = localStorage.getItem("mycogenSettings");
    if (!saved) return;
    var data = JSON.parse(saved);
    applyTheme(data.theme);
}

function applyTheme(theme) {
    if (theme === "Dark") document.body.classList.add("dark-theme");
    else document.body.classList.remove("dark-theme");
}

function openModal() {
    var modal = document.getElementById("addUserModal");
    if (modal) modal.classList.add("show-modal");
}

function closeModal() {
    var modal = document.getElementById("addUserModal");
    if (modal) modal.classList.remove("show-modal");
}

function addNewUser(event) {
    event.preventDefault();

    var name = document.getElementById("newName").value;
    var username = document.getElementById("newUsername").value;
    var status = document.getElementById("newStatus").value;
    var role = document.getElementById("newRole").value;

    var newMember = {
        employeeId: "EMP" + String(teamMembers.length + 1).padStart(3, "0"),
        name: name,
        username: username,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=" + encodeURIComponent(name),
        email: username.replace("@", "") + "@mycogenbakery.com",
        phone: "+84 900 000 000",
        gender: "Unknown",
        birthday: "2000-01-01",
        address: "Ho Chi Minh City",
        status: status,
        joinDate: "June 24, 2026",
        lastActive: "Just now",
        role: role,
        branch: "District 1 Branch",
        shift: "Morning Shift",
        bio: "New bakery employee profile.",
        stats: { orders: 0, monthlyRevenue: 0, rating: 0, attendance: 100 },
        skills: [{ name: "Customer Service", level: 70 }],
        activities: [{ title: "New user created", time: "Just now" }]
    };

    teamMembers.push(newMember);
    loadTeamMembers(teamMembers);
    closeModal();
    showTab("account");
    loadAccountInfo(newMember, teamMembers.length - 1);
    this.reset();
}

function exportCSV() {
    var csv = "Full Name,Username,Status,Join Date,Last Active,Role\n";
    teamMembers.forEach(function(member) {
        csv += member.name + "," + member.username + "," + member.status + "," + member.joinDate + "," + member.lastActive + "," + member.role + "\n";
    });

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "team-members.csv";
    link.click();
}

function renderMyProfilePage(members) {
    var params = new URLSearchParams(window.location.search);
    var username = params.get("user") || currentUser;

    var profile = members.find(function(member) {
        return member.username === username;
    }) || members[0];

    if (!profile) return;

    setValue("profileAvatar", profile.avatar, "src");
    setValue("profileName", profile.name);
    setValue("profileRole", profile.role);

    var status = document.getElementById("profileStatus");
    if (status) {
        status.innerHTML = profile.status;
        status.className = "member-status " + profile.status.toLowerCase();
    }

    setValue("profileEmployeeId", profile.employeeId);
    setValue("profileBranch", profile.branch);
    setValue("profileShift", profile.shift);
    setValue("profileEmail", profile.email);
    setValue("profilePhone", profile.phone);
    setValue("profileGender", profile.gender);
    setValue("profileBirthday", profile.birthday);
    setValue("profileHireDate", profile.joinDate);
    setValue("profileAddress", profile.address);
    setValue("profileBio", profile.bio);
    setValue("statOrders", profile.stats.orders);
    setValue("statRevenue", formatMoney(profile.stats.monthlyRevenue));
    setValue("statRating", profile.stats.rating + " / 5");
    setValue("statAttendance", profile.stats.attendance + "%");

    renderSkills(profile.skills);
    renderActivities(profile.activities);
}

function renderSkills(skills) {
    var box = document.getElementById("skillsList");
    if (!box) return;
    box.innerHTML = "";

    skills.forEach(function(skill) {
        box.innerHTML +=
            "<div class='skill-item'>" +
            "<div class='skill-top'><span>" + skill.name + "</span><strong>" + skill.level + "%</strong></div>" +
            "<div class='skill-progress'><div style='width:" + skill.level + "%'></div></div>" +
            "</div>";
    });
}

function renderActivities(activities) {
    var box = document.getElementById("activitiesList");
    if (!box) return;
    box.innerHTML = "";

    activities.forEach(function(activity) {
        box.innerHTML +=
            "<div class='activity-item'>" +
            "<div class='activity-icon'><i class='fa-solid fa-check'></i></div>" +
            "<div><h4>" + activity.title + "</h4><p>" + activity.time + "</p></div>" +
            "</div>";
    });
}

function formatMoney(value) {
    if (value === 0) return "0 VND";
    return (value / 1000000).toFixed(0) + "M VND";
}
