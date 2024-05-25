function loadApplications() {
    if ("content" in document.createElement("template")) {
        console.log("Fetching content...")
        fetch('/api/applications')
        .then(response => response.json()
            .then(applications => {
                var applicationGrid = document.getElementById("applicationGrid")
                applicationGrid.innerHTML = ""
                applications.forEach(application => {
                    var applicationHTML = document.getElementById("application").content.cloneNode(true);
                    applicationHTML.getElementById("productImage").setAttribute("src", application["preview"])
                    applicationHTML.getElementById("productTitle").innerText = application["title"]
                    applicationHTML.getElementById("productPrice").innerText = application["price"]
                    applicationHTML.getElementById("productPage").innerText = application["source"]
                    applicationHTML.getElementById("productApplicant").innerText = application["applicant"]["name"]
                    applicationGrid.appendChild(applicationHTML)
                })
            })
            .catch(error => console.log(error))
        )
            .catch(error => console.log(error))
    } else {
        console.log("Browser doesnt support <template>")
    }
}

window.onload = loadApplications