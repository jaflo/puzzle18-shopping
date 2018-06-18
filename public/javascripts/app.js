// CAPTCHA

var captchaLoaded = false;

$(".captcha").click(function(e) {
	if ($(e.target).is("a, img, .challenge, .challenge *")) return;
	if (!captchaLoaded) {
		$(".captcha").addClass("loading");
		$(".captcha .grid > div").removeClass("selected");
		fetch("/captcha/get").then(function(response) {
			return response.json();
		}).then(function(data) {
			$(".captcha .prompt strong").text(data.label);
			$(".captcha .challengeid").val(data.challenge);
			$(".captcha .grid div").each(function(i, el) {
				$(el)
					.attr("id", data.images[i].split(".")[0])
					.css("background-image", "url(/images/captcha/"+data.images[i]+")");
			});
			tryShowCaptcha();
		}).catch(function(ex) {
			console.log("parsing failed", ex);
		});
		setTimeout(tryShowCaptcha, 300);
	} else {
		$(".captcha .challenge").fadeIn(300);
	}
});

var captchaReadiness = 0;
function tryShowCaptcha() {
	captchaReadiness++;
	if (captchaReadiness >= 2) {
		$(".captcha .challenge").fadeIn(300);
		$(".captcha").removeClass("loading");
		captchaLoaded = true;
	}
}

$(document).click(function(e) {
	if (!$(e.target).is(".captcha, .captcha *")) {
		$(".captcha .challenge").fadeOut(300);
	}
});

var selected = [];
$(".captcha .grid > div").click(function() {
	$(this).toggleClass("selected");
	selected = [];
	$(".captcha .grid .selected").each(function(i, el) {
		selected.push($(el).attr("id"));
	});
});

$(".captcha .main").click(function() {
	$(".captcha .message").hide();
	if (selected.length < 2) {
		$(".captcha .message").text("Please select all matching images.").show();
		return;
	}
	$(".captcha").addClass("loading");
	fetch("/captcha/verify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			challenge: $(".captcha .challengeid").val(),
			selected: selected
		})
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		if (data.status == "passed") {
			$(".captcha .verification").val(data.verification);
			$(".captcha").removeClass("loading").addClass("verified");
			$(".captcha .challenge").fadeOut(300);
			$(".captcha").off("click");
		} else {
			$(".captcha .message").text("Please try again.").show();
			captchaLoaded = false;
			$(".captcha").click();
		}
	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
});

// Promo

$(".promo").on("submit", function() {
	$(".promo .apply").text("Checking...");
	$(".promo .error").text("");
	fetch("/applypromo", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			code: $(".promo .code").val(),
			challenge: $(".captcha .challengeid").val(),
			verification: $(".captcha .verification").val()
		})
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		if (data.status == "success") {
			$(".receipt .divider").before('<div class="promo"><span>Promo code ('+$(".promo .code").val()+')</span>-1.00</div>');
			$(".promo .apply").text("Apply");
			$(".receipt .total strong").text(parseInt($(".receipt .total strong").text())-1+".00");
			if ($(".captcha").length > 0) location.reload();
		} else {
			$(".promo .error").text(data.reason);
			$(".promo .apply").text("Apply");
			if (data.reason.indexOf("captcha") > -1 && $(".captcha").length == 0) location.reload();
		}
		$(".promo .code").val("");
	}).catch(function(ex) {
		console.log("parsing failed", ex);
	});
	return false;
});

$(".continue .off").click(function() {
	return false;
});
