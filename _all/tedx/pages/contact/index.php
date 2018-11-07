<!DOCTYPE html>
<html>
<head>
	<?php include('../../assets/templates/head.php') ?>
</head>
<body>
	<?php include('../../assets/templates/nav.php') ?>
	<div class="section light">
		<div class="content">
			<div class="align-mid">
				<h1>Contact Us</h1>
			</div>
		</div>
		<div class="content">
			<form>
				<input type="text" id="name" name="name" placeholder="Name">
				<input type="email" id="email" name="email" placeholder="Email">
				<input type="text" id="subject" name="subject" placeholder="Subject">
				<textarea id="message" name="message" placeholder="Message"></textarea>
				<input type="submit" value="Submit">
			</form>
		</div>
	</div>
	<?php include('../../assets/templates/footer.php') ?>
</body>
</html>