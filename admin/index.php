<?php
session_start();

if (isset($_SESSION['logged_in'])) {
  header("Location: ./panel.php");
}
 ?>
<!DOCTYPE HTML>
<html>
  <head>
    <title>Administrator Page</title>
    <link rel="shortcut icon" href="/images/favicon.png" />
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!--[if lte IE 8]><script src="assets/js/ie/html5shiv.js"></script><![endif]-->
		<link rel="stylesheet" href="/assets/css/main.css" />
		<!--[if lte IE 8]><link rel="stylesheet" href="assets/css/ie8.css" /><![endif]-->
		<!--[if lte IE 9]><link rel="stylesheet" href="assets/css/ie9.css" /><![endif]-->
  </head>
  <body>
    <div id="page-wrapper">

			<!-- Header -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/header.php') ?>

			<!-- Main -->
				<article id="main">

					<header class="special container">
						<!-- <span class="icon fa-envelope"></span> -->
						<h2>Sign In</h2>
						<p>Sign in in order to access administrator control panel.</p>
            <br />
            <br class="error" />
            <p class="error"></p>
					</header>

					<!-- One -->
						<section class="wrapper style4 special container 75%">

							<!-- Content -->
								<div class="content">
									<form>
										<div class="row 50%">
											<div class="12u">
												<input type="text" id="username" name="username" placeholder="Username" />
											</div>
										</div>
                    <div class="row 50%">
											<div class="12u">
												<input type="password" id="password" name="password" placeholder="Password" />
											</div>
										</div>
										<div class="row">
											<div class="12u">
												<ul class="buttons">
													<li><input type="button" id="admin-login" class="special" value="Login" /></li>
												</ul>
											</div>
										</div>
									</form>
								</div>

						</section>

				</article>

			<!-- Footer -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/footer.php') ?>

		</div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="login.js"></script>

  </body>
</html>
