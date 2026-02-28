<?php
// /index.php - Updated with Articles Section
// Main entry point with PHP includes and new articles section

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hadi Vahidi | Front-End Developer</title>
    <meta name="description" content="Hadi Vahidi - Front-End Developer (AI Rider) specializing in creating elegant, efficient web experiences.">
    
    <!-- Favicon -->
    <link rel="icon" href="assets/images/favicon.png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/main.css">
    
    <!-- Add updated CSS files (can be added manually to main.css imports too) -->
    <link rel="stylesheet" href="css/components/project-detail.css">
    <link rel="stylesheet" href="css/components/cursor.css">
</head>
<body>
    <?php include('templates/components/cursor.html'); ?>
    <?php include('templates/components/theme-toggle.html'); ?>
    <?php include('templates/components/navigation.html'); ?>
    <?php include('templates/components/progress-bar.html'); ?>
    
    <main>
        <?php include('templates/sections/intro.php'); ?>
        <?php include('templates/sections/skills.html'); ?>
        <?php include('templates/sections/work.html'); ?>
        <?php include('templates/sections/experience.html'); ?>
        <?php include('templates/sections/articles.php'); ?>
        <?php include('templates/sections/contact.php'); ?>
    </main>

    <?php include('templates/sections/footer.php'); ?>
    
    <!-- Scripts -->
    <script type="module" src="js/main.js"></script>
    <script src="js/centeredDetailPanelFix.js"></script>
    <script src="js/cursor-fix.js"></script>
    <script src="js/improvedSlideshowScroll.js"></script>
    <script src="js/autoPositionFix.js"></script>
</body>
</html>