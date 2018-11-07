<?php
session_start();
if (!isset($_SESSION['logged_in'])) {
  header("Location: " . $_SERVER['DOCUMENT_ROOT']);
}

?>
<!DOCTYPE HTML>
<html>
  <head>
    <title>Edit Blog Posts</title>
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
						<h2>Edit Blog Posts</h2>
					</header>

					<!-- One -->
						<section class="edit-entries wrapper style4 container 100%">

              <div class="notification wrapper style4 container 25%">
                <h3>Deleted!</h3>
                <p>Content deleted!</p>
              </div>

							<!-- Content -->
								<div class="content">
                  <ul>
                    <?php
                      require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');
                      $link = mysqli_connect($servername, $username, $password, $database);

                      if ($link === false) {
                        echo 'error';
                        die("Connect Failed: " . mysqli_connect_error());
                      }

                      $sql = "SELECT * FROM blog_posts";

                      if ($result = mysqli_query($link, $sql)) {
                        if (mysqli_num_rows($result) > 0) {
                          while ($row = mysqli_fetch_assoc($result)) {
                            $items[] = $row;
                          }
                          $items = array_reverse($items, true);
                          foreach ($items as $row) {
                            echo "<li class='post_block'><div data-id='" . $row['id'] . "' class='post'>";
                            echo "<a href='edit.php?id=" . $row['id'] . "&subject=" . $row['subject'] . "&desc=" . $row['desc'] . "&content=" . $row['content'] . "&img=" . $row['image'] . "'><span class='icon fa-edit'></span></a><a href='' onclick='return false;'><span class='icon fa-close'></span></a>";
                            if ($row['image'] != '') echo "<img src='/posts/images/" . $row['image'] . "'>";
                            echo "<h3>" . $row['subject'] . "</h3>";
                            echo "<p class='author'>by " . $row['author'] . " [" . $row['sub_date'] . "]</p>";
                            echo "<p>" . $row['content'] . "</p></div></li>";
                          }
                        } else {
                          echo "<li><p>No posts to edit.</p></li>";
                        }
                      } else echo "failure";

                      mysqli_close($link);
                     ?>
                  </ul>
								</div>

						</section>

				</article>

			<!-- Footer -->
			<?php include($_SERVER['DOCUMENT_ROOT'] . '/templates/footer.php') ?>

		</div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="delete.js"></script>
  </body>
</html>
