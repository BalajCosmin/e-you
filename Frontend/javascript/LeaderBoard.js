document.addEventListener("DOMContentLoaded", function() {
  getLeaderBoardData();
});

function getLeaderBoardData() {
  fetch("http://localhost:8080/users/ranking?n=5", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
      .then((response) => response.json())
      .then((res) => mapUsersToLeaderBoard(res))
      .catch(error => {
        console.error("Error fetching leaderboard:", error);
      });
}

function mapUsersToLeaderBoard(users) {
  if (!users || !users.data || users.data.length === 0) {
    console.log("No user data available");
    return;
  }

  let holder = document.getElementsByClassName("lboard_wrap")[0];
  holder.innerHTML = "";

  users.data.forEach((user, index) => {
    let contentStringAllMarkers = `
      <div class="lboard_item today" style="display: block">
        <div class="lboard_mem">
          <div class="img">
            ${user.photo_path ?
        `<img src="${user.photo_path}" alt="${user.username}" onerror="this.src='../defaulst_pfp.jpg'">` :
        `<img src="../default_pfp.jpg" alt="${user.username}">`
    }
          </div>
          <div class="name_bar">
            <p><span>${index + 1}.</span> ${user.username}</p>
          </div>
          <div class="points">${user.score} puncte</div>
        </div>
      </div>
    `;

    holder.insertAdjacentHTML('beforeend', contentStringAllMarkers);
  });
}
