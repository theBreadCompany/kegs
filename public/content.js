function loadData() {
    // Is there data (i.e. because we return from a login)?
    let params = new URL(document.location.toString()).searchParams
    if(params.get("username")) {
        params.forEach((value, name) => document.cookie = name + "=" + value + "; SameSite=Strict; Secure");
        location.search = ""
    }

    setUserdata()
    loadApplications()
}
window.onload = loadData

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
                    applicationHTML.getElementById("productPage").setAttribute("href", application["source"])
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

function setUserdata() {
    if(document.cookie) {
        document.getElementById("loginbutton").classList.add("hidden");

        let params = new URLSearchParams(document.cookie.replaceAll("; ", "&"))
        let avatarHTML = document.getElementById("avatar")
        avatarHTML.setAttribute("src", `https://cdn.discordapp.com/avatars/${params.get("id")}/${params.get("avatar")}.png`)
        document.getElementById("accountname").innerText = params.get("username")

        let accountHTML = document.getElementById("account")
        accountHTML.classList.remove("hidden")
        document.getElementById("logoutbutton").classList.remove("hidden")
    }
}
function deleteUserdata() {
    const params = new URLSearchParams(document.cookie.replaceAll("; ", "&"))
    params.forEach((value, name) => document.cookie = name + "=" + value + "; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC");
}
function addItemPrefetchURL(event) {
    let url = new URL(document.getElementById("newItemURL").value)
    if(url) {
        fetch('/api/corsproxy?' + new URLSearchParams({ 'url': url.toString()}).toString(), {
            headers: new Headers({ 'User-Agent': 'UserMozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0'})
        })
            .then(response => {
            response.text().then((txt) => {
                console.log(txt)
                let itemDoc = new DOMParser().parseFromString(txt, 'text/html')
                document.getElementById("newItemTitle").setAttribute("value", itemDoc.querySelector('meta[property~="og:title"]').content)
                document.getElementById("newItemPreview").setAttribute("src", itemDoc.querySelector('meta[property~="og:image"]').content)

                if(url.toString().match("/aliexpress")) {
                    // FIXME: find a safer way to do this
                    // god forbid god forbid god forbid god forbid god forbid god forbid god forbid god forbid
                    // god forbid god forbid god forbid god forbid god forbid god forbid god forbid god forbid
                    // god forbid god forbid god forbid god forbid god forbid god forbid god forbid god forbid
                    eval(itemDoc.getElementsByTagName("script")[0].innerText)
                    let price = window.runParams.data.priceComponent.origPrice.minAmount.formatedAmount

                    document.getElementById("newItemPrice").setAttribute("value", price)
                }
            })
        })
    }
}
function addItem() {
    const params = new URLSearchParams(document.cookie.replaceAll("; ", "&"))
    fetch('/api/applications?' + new URLSearchParams({
        'source': document.getElementById("newItemURL").value,
        'preview': document.getElementById("newItemPreview").getAttribute("src"),
        'title': document.getElementById("newItemTitle").value,
        'price': document.getElementById("newItemPrice").value,
        'user': params.get("id"),
        'name': params.get("username"),
        'avatar': params.get("avatar"),
    }).toString(), {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded'})
    })
        .then(response => {
            loadApplications()
        })

}
function showModal() {
    document.getElementById("main").classList.add("blur-md");
    document.getElementById("modal").classList.remove("hidden");
}
function hideModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("main").classList.remove("blur-md");
}