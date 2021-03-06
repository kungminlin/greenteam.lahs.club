<?php
session_start();

if (!isset($_SESSION['logged_in'])) {
  header("Location: " . $_SERVER['DOCUMENT_ROOT']);
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
						<h2>Edit Blog Post</h2>
					</header>

					<!-- One -->
						<section class="wrapper style4 special container 75%">
              <div class="notification wrapper style4 container 25%">
                <h3>Posted!</h3>
                <p>Content updated!</p>
              </div>
							<!-- Content -->
								<div class="content">
									<form data-id="<?php echo $_GET['id'] ?>" data-img="<?php echo $_GET['img'] ?>" id="blogpost" method="post" enctype="multipart/form-data">
										<div class="row">
											<div class="12u">
												<input type="text" id="title" name="title" value="<?php echo $_GET['subject'] ?>" />
											</div>
                      <div class="12u">
                        <h4>Upload Image</h4>
                        <input type="file" id="image" name="image" />
                      </div>
										</div>
                    <div class="row">
											<div class="12u">
                        <textarea form="blogpost" id="description" name="description" rows="5"><?php echo $_GET['desc']; ?></textarea>
											</div>
										</div>
										<div class="row">
											<div class="12u">
												<textarea form="blogpost" id="paragraph" name="paragraph" rows="15"><?php echo $_GET['content']; ?></textarea>
											</div>
										</div>
                    <br />
                    <input type="button" id="post-entry" name="post-entry" value="Update">
									</form>
								</div>

						</section>

				</article>

			<!-- Footer -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/footer.php') ?>

		</div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="edit.js"></script>

  </body>
</html>
