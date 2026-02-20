document.addEventListener("DOMContentLoaded", function () {

    // =======================
    // ROLE - SKILL MAPPING
    // =======================

    const roleSkills = {
    "Data Scientist": {
        "python": 3,
        "machine learning": 3,
        "statistics": 2,
        "maths": 2
    },
    "Software Developer": {
        "dsa": 3,
        "java": 2,
        "dbms": 2
    },
    "AI Engineer": {
        "machine learning": 3,
        "deep learning": 3,
        "python": 2
    }
};


    // =======================
    // SKILL MATCH FUNCTION
    // =======================

    function calculateMatch(selectedRole, studentSkills) {

    const requiredSkills = roleSkills[selectedRole];

    if (!requiredSkills) {
        return { percentage: 0, missing: [] };
    }

    let totalWeight = 0;
    let matchedWeight = 0;
    let missingSkills = [];

    for (let skill in requiredSkills) {

        totalWeight += requiredSkills[skill];

        if (studentSkills.includes(skill.toLowerCase())) {
            matchedWeight += requiredSkills[skill];
        } else {
            missingSkills.push(skill);
        }
    }

    let matchPercentage = (matchedWeight / totalWeight) * 100;

    return {
        percentage: matchPercentage,
        missing: missingSkills
    };
}


    // =======================
    // CAREER READINESS SCORE
    // =======================

    function calculateCRS(matchPercentage, attendanceScore) {
        return (matchPercentage * 0.7) + (attendanceScore * 0.3);
    }

    // =======================
    // SAFE EVENT LISTENERS
    // =======================

    let addBtn = document.getElementById("addBtn");
    if (addBtn) {
        addBtn.addEventListener("click", generateFields);
    }

    let analyzeBtn = document.getElementById("analyzeBtn");
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyze);
    }

    // =======================
    // GENERATE SUBJECT FIELDS
    // =======================

    function generateFields() {

        let count = document.getElementById("subjects").value;
        let container = document.getElementById("attendanceFields");

        container.innerHTML = "";

        for (let i = 1; i <= count; i++) {

            container.innerHTML += `
                <input type="text" class="form-control mb-1 subjectName"
                placeholder="Subject Name ${i}">

                <input type="number" class="form-control mb-2 attendance"
                placeholder="Attendance % for Subject ${i}">
            `;
        }

        document.getElementById("analyzeBtn").disabled = false;
    }

    // =======================
    // MAIN ANALYZE FUNCTION
    // =======================

    function analyze() {

        let name = document.getElementById("name").value;
        let role = document.getElementById("role").value;
        let skills = document.getElementById("skills").value;

        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }

        if (!role) {
            alert("Please select a role.");
            return;
        }

        if (!skills.trim()) {
            alert("Please enter your skills.");
            return;
        }

        let importantSubjects = [];

        if (role === "Data Scientist") {
            importantSubjects = ["maths", "statistics", "machine learning", "python"];
        }
        else if (role === "Software Developer") {
            importantSubjects = ["dsa", "java", "dbms"];
        }
        else if (role === "AI Engineer") {
            importantSubjects = ["machine learning", "deep learning", "python"];
        }

        const subjectInputs = document.getElementsByClassName("subjectName");
        const attendanceInputs = document.getElementsByClassName("attendance");

        let importantTotal = 0;
        let importantCount = 0;
        let otherTotal = 0;
        let otherCount = 0;

        let subjectsData = [];

        for (let i = 0; i < subjectInputs.length; i++) {

            let subject = subjectInputs[i].value.toLowerCase();
            let attendance = parseInt(attendanceInputs[i].value) || 0;

            subjectsData.push({
                subject: subject,
                attendance: attendance
            });

            if (importantSubjects.includes(subject)) {
                importantTotal += attendance;
                importantCount++;
            } else {
                otherTotal += attendance;
                otherCount++;
            }
        }

        let importantAvg = importantCount > 0 ? importantTotal / importantCount : 0;
        let otherAvg = otherCount > 0 ? otherTotal / otherCount : 0;

        let finalAttendanceScore = (importantAvg * 0.6) + (otherAvg * 0.4);

        let studentSkills = skills
            .split(",")
            .map(skill => skill.trim().toLowerCase())
            .filter(skill => skill !== "");

        let matchResult = calculateMatch(role, studentSkills);

        let crs = calculateCRS(matchResult.percentage, finalAttendanceScore);
        if (finalAttendanceScore > 80) {
            crs += 5;
        }
        if (crs > 100) {
            crs = 100;
        }


        // Eligibility Logic
        let eligibilityStatus = "";
        let eligibilityNote = "";

        if (crs >= 70) {
            eligibilityStatus = "Eligible / Job Ready";
            eligibilityNote = "You can confidently apply for this role.";
        }
        else if (crs >= 50) {
            eligibilityStatus = "Almost Ready";
            eligibilityNote = "Improve missing skills to become fully eligible.";
        }
        else {
            eligibilityStatus = "Beginner";
            eligibilityNote = "Focus on fundamentals and build required skills.";
        }


        let finalData = {
            name: name,
            role: role,
            skills: skills,
            subjects: subjectsData,
            attendanceScore: finalAttendanceScore,
            matchPercentage: matchResult.percentage,
            missingSkills: matchResult.missing,
            crsScore: crs,
            eligibilityStatus: eligibilityStatus,
            eligibilityNote: eligibilityNote
        };

        localStorage.setItem("analysisData", JSON.stringify(finalData));

        window.location.href = "result.html";
    }

    // =======================
    // RESULT PAGE RENDER
    // =======================

    let data = JSON.parse(localStorage.getItem("analysisData"));

    if (data && document.getElementById("welcome")) {

        document.getElementById("welcome").innerText =
            "Hello " + data.name;

        document.getElementById("role").innerText =
            "Target Role: " + data.role;

        document.getElementById("skills").innerText =
            "Your Skills: " + data.skills;

        document.getElementById("attendance").innerText =
            "Weighted Attendance Score: " + data.attendanceScore.toFixed(2);

        let skillMatch = Math.round(data.matchPercentage);

        document.getElementById("skillBar").style.width =
            skillMatch + "%";

        document.getElementById("skillBar").innerText =
            skillMatch + "%";

        let score = Math.round(data.crsScore);

        document.getElementById("finalScore").innerText =
            score + " / 100 (" + data.eligibilityStatus + ")";

        document.getElementById("statusNote").innerText =
            data.eligibilityNote;

        let missingList = document.getElementById("missingList");
        missingList.innerHTML = "";


        if (data.missingSkills.length === 0) {

            let li = document.createElement("li");
            li.className = "list-group-item list-group-item-success";
            li.innerText = "No missing skills";
            missingList.appendChild(li);

        } else {

            data.missingSkills.forEach(skill => {

                let li = document.createElement("li");
                li.className = "list-group-item list-group-item-danger";
                li.innerText = skill;
                missingList.appendChild(li);

            });
        }
    }

});