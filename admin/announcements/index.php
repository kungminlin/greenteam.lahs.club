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
    <title>Announcements</title>
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
						<h2>Announcements</h2>
            <p>Send Green Team Emails with Style!</p>
					</header>

					<!-- One -->
						<section class="wrapper style4 container 100%">

							<!-- Content -->
								<div class="content options">
                  <form id="email" method="post" enctype="multipart/form-data">
										<div class="row">
											<div class="12u">
												<input type="text" id="title" name="title" placeholder="Title" />
											</div>
                      <div class="12u">
                        <select>
                          <option value="1">Announcements</option>
                          <option value="2">Volunteer Opportunities</option>
                          <option value="3">General Outreach</option>
                        </select>
                      </div>
										</div>
                    <div class="row">
											<div class="12u">
                        <textarea form="blogpost" id="description" name="description" placeholder="Description" rows="5"></textarea>
											</div>
										</div>
										<div class="row">
											<div class="12u">
												<textarea form="blogpost" id="paragraph" name="paragraph" placeholder="Something to write about..." rows="15"></textarea>
											</div>
										</div>
                    <br />
                    <input type="button" id="post-entry" name="post-entry" value="Post Blog">
									</form>
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
