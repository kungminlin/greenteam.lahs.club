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
			<li><a href="/admin" class="button special">
				<?php
					session_start();
					if (isset($_SESSION['logged_in'])) echo 'admin';
					else echo 'login';
				 ?>
			</a></li>
		</ul>
	</nav>
</header>
