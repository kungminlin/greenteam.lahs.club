<?php
session_start();
if (!isset($_SESSION['logged_in'])) {
  header("Location: " . $_SERVER['DOCUMENT_ROOT']);
}

$user = $_SESSION['logged_in'];
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
      <header id="header">
      	<h1 id="logo"><a href="/">LAHS <span style="color:#66bb6a">GREEN TEAM</span></a></h1>
      	<nav id="nav">
      		<ul>
      			<li class="current"><a href="/">HOME</a></li>
      			<li class="submenu">
      				<a href="#">MENU</a>
      				<ul>
      					<li><a href="/about">ABOUT</a></li>
      					<li><a href="/events">EVENTS AND CONFERENCES</a></li>
      					<li><a href="/posts">POSTS</a></li>
      					<li><a href="/contact">CONTACT</a></li>
      <!-- 									<li class="submenu">
      						<a href="#">Submenu</a>
      						<ul>
      							<li><a href="#">Dolore Sed</a></li>
      							<li><a href="#">Consequat</a></li>
      							<li><a href="#">Lorem Magna</a></li>
      							<li><a href="#">Sed Magna</a></li>
      							<li><a href="#">Ipsum Nisl</a></li>
      						</ul>
      					</li> -->
      				</ul>
      			</li>
      			<li><a id="logout" href="/" class="button special">Logout</a></li>
      		</ul>
      	</nav>
      </header>

			<!-- Main -->
				<article id="main">

					<header class="special container">
						<!-- <span class="icon fa-envelope"></span> -->
						<h2>Administrator Panel</h2>
						<p>Welcome, agent <?php echo $user['first_name'] . ' ' . $user['last_name']; ?>. What would you like to do?</p>
					</header>

					<!-- One -->
						<section class="wrapper style4 container 100%">

							<!-- Content -->
								<div class="content options">
                  <ul>
                    <li><a href="announcements" class="button center">Post Announcements</a></li>
                    <li><a href="blogpost" class="button center">Create New Blog Post</a></li>
                    <li><a href="blogedit" class="button center">Edit Blog Posts</a></li>
                  </ul>
								</div>

						</section>

				</article>

			<!-- Footer -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/footer.php') ?>

		</div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="logout.js"></script>

  </body>
</html>
