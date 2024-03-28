$(document).ready(function () {
  oJogo();
});

function oJogo() {
  $("#start").on("click", () => {
    $("#start").remove();
    $("#main_btns").append(
      ["Fácil", "Díficil"].map((text) => {
        return $("<div>", { text, class: "btn btn-lg btn-default mx-1" }).on(
          "click",
          () => console.debug("asdsakjdbsad")
        );
      })
    );
  });
}
