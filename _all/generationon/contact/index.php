<!DOCTYPE html>
<html>
<head>
	<?php include('../assets/templates/head.php') ?>
</head>
	<?php include('../assets/templates/nav.php') ?>
<body>
	<div class="wrapper">
		<main>
			<div class="section light" style="display:block">
				<div class="content">
					<div class="align-mid">
						<h1>Contact Us</h1>
					</div>
				</div>
				<div class="content">
					<form method="post" action="form.php">
						<input type="text" id="name" name="name" placeholder="Name">
						<input type="email" id="email" name="email" placeholder="Email">
						<input type="text" id="subject" name="subject" placeholder="Subject">
						<textarea id="message" name="message" placeholder="Message"></textarea>
						<input type="submit" value="Submit">
					</form>
				</div>
			</div>
		</main>

		<?php include('../assets/templates/footer.php') ?>
	</div>
</body>
</html>
