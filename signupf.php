<?php
// Database connection details
$host = 'localhost';
$user = 'root'; // Default MySQL user for XAMPP
$password = ''; // Default MySQL password for XAMPP
$dbname = 'freelancing_platform';

// Create a connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form data and insert into database
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $fullname = $conn->real_escape_string($_POST['fullname']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT); // Encrypt the password
    $skills = $conn->real_escape_string($_POST['skills']);
    $experience = $conn->real_escape_string($_POST['experience']);
    $location = $conn->real_escape_string($_POST['location']);
    $hourly_rate = $conn->real_escape_string($_POST['hourly_rate']);
    $description = $conn->real_escape_string($_POST['description']);

    // SQL query to insert data
    $sql = "INSERT INTO freelancers (fullname, email, password, skills, experience, location, hourly_rate, description)
            VALUES ('$fullname', '$email', '$password', '$skills', '$experience', '$location', '$hourly_rate', '$description')";

    if ($conn->query($sql) === TRUE) {
        echo "Signup successful!";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}
?>