<!DOCTYPE HTML>
<!--
	Twenty by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html>
	<head>
		<title>Posts - LAHS Green Team</title>
		<link rel="shortcut icon" href="/images/favicon.png" />
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!--[if lte IE 8]><script src="assets/js/ie/html5shiv.js"></script><![endif]-->
		<link rel="stylesheet" href="/assets/css/main.css" />
		<!--[if lte IE 8]><link rel="stylesheet" href="assets/css/ie8.css" /><![endif]-->
		<!--[if lte IE 9]><link rel="stylesheet" href="assets/css/ie9.css" /><![endif]-->
	</head>
	<body class="right-sidebar">
		<div id="page-wrapper">

			<!-- Header -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/header.php') ?>

			<!-- Main -->
				<article id="main">

					<header class="special container">
						<span class="icon fa-tablet"></span>
						<h2>A <strong>look</strong> of green</h2>
						<p>News about environmental protection regarding our community and around the globe.</p>
					</header>

					<!-- One -->
						<section class="wrapper style4 container">

							<div class="row 150%">
								<div class="8u 12u(narrower)">

									<!-- Content -->
										<div class="content">
											<section>
												<!-- <a href="#" class="image featured"><img src="images/pic03.jpg" alt="" /></a> -->
												<?php

												require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

												$connect = new mysqli($servername, $username, $password, $database);

												if ($connect->connect_error) {
													echo 'error';
													die("Connect Failed: " . $connect->connect_error);
												}

												$sql = "SELECT * FROM blog_posts";
												$result = $connect->query($sql);

												if ($result->num_rows > 0) {
													while ($row = $result->fetch_assoc()) {
														$items[] = $row;
													}
													$items = array_reverse($items, true);
													foreach ($items as $row) {
														echo "<div data-id='" . $row['id'] . "' class='post'>";
														if ($row['image'] != '') echo "<img src='images/" . $row['image'] . "'>";
														echo "<h3>" . $row['subject'] . "</h3>";
														echo "<p class='author'>by " . $row['author'] . " [" . $row['sub_date'] . "].";
														if ($row['editor'] != '') echo "<br />Edited by " . $row['editor'] . " [" . $row['edit_date'] . "].";
														echo "</p>";
														echo "<p>" . $row['content'] . "</p></div><br />";
													}
												} else {
													echo "<p>There are no recent posts.</p>";
												}

												 ?>
											</section>
										</div>

								</div>
								<div class="4u 12u(narrower)">

									<!-- Sidebar -->
										<div class="sidebar">
											<section>
												<header>
													<h3>Magna Feugiat</h3>
												</header>
												<p>Sed tristique purus vitae volutpat commodo suscipit amet sed nibh. Proin a ullamcorper sed blandit. Sed tristique purus vitae volutpat commodo suscipit ullamcorper commodo suscipit amet sed nibh. Proin a ullamcorper sed blandit</p>
												<footer>
													<ul class="buttons">
														<li><a href="#" class="button small">Learn More</a></li>
													</ul>
												</footer>
											</section>

											<section>
												<a href="#" class="image featured"><img src="images/pic04.jpg" alt="" /></a>
												<header>
													<h3>Amet Lorem Tempus</h3>
												</header>
												<p>Sed tristique purus vitae volutpat commodo suscipit amet sed nibh. Proin a ullamcorper sed blandit. Sed tristique purus vitae volutpat commodo suscipit ullamcorper sed blandit lorem ipsum dolore.</p>
												<footer>
													<ul class="buttons">
														<li><a href="#" class="button small">Learn More</a></li>
													</ul>
												</footer>
											</section>
										</div>

								</div>
							</div>
						</section>

					<!-- Two -->
						<!-- <section class="wrapper style1 container special">
							<div class="row">
								<div class="4u 12u(narrower)">

									<section>
										<header>
											<h3>This is Something</h3>
										</header>
										<p>Sed tristique purus vitae volutpat ultrices. Aliquam eu elit eget arcu commodo suscipit dolor nec nibh. Proin a ullamcorper elit, et sagittis turpis. Integer ut fermentum.</p>
										<footer>
											<ul class="buttons">
												<li><a href="#" class="button small">Learn More</a></li>
											</ul>
										</footer>
									</section>

								</div>
								<div class="4u 12u(narrower)">

									<section>
										<header>
											<h3>Also Something</h3>
										</header>
										<p>Sed tristique purus vitae volutpat ultrices. Aliquam eu elit eget arcu commodo suscipit dolor nec nibh. Proin a ullamcorper elit, et sagittis turpis. Integer ut fermentum.</p>
										<footer>
											<ul class="buttons">
												<li><a href="#" class="button small">Learn More</a></li>
											</ul>
										</footer>
									</section>

								</div>
								<div class="4u 12u(narrower)">

									<section>
										<header>
											<h3>Probably Something</h3>
										</header>
										<p>Sed tristique purus vitae volutpat ultrices. Aliquam eu elit eget arcu commodo suscipit dolor nec nibh. Proin a ullamcorper elit, et sagittis turpis. Integer ut fermentum.</p>
										<footer>
											<ul class="buttons">
												<li><a href="#" class="button small">Learn More</a></li>
											</ul>
										</footer>
									</section>

								</div>
							</div>
						</section> -->

				</article>

			<!-- Footer -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/footer.php') ?>

		</div>

		<!-- Scripts -->
			<script src="/assets/js/jquery.min.js"></script>
			<script src="/assets/js/jquery.dropotron.min.js"></script>
			<script src="/assets/js/jquery.scrolly.min.js"></script>
			<script src="/assets/js/jquery.scrollgress.min.js"></script>
			<script src="/assets/js/skel.min.js"></script>
			<script src="/assets/js/util.js"></script>
			<!--[if lte IE 8]><script src="/assets/js/ie/respond.min.js"></script><![endif]-->
			<script src="/assets/js/main.js"></script>

	</body>
</html>
