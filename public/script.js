// script.js

// Function to make an AJAX request to the server
function makeRequest(url, method, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          callback(null, JSON.parse(xhr.responseText));
        } else {
          callback(new Error('Request failed'));
        }
      }
    };
    xhr.send(JSON.stringify(data));
  }
  
  // Function to handle the form submission
  function handleFormSubmit(event) {
    event.preventDefault();
  
    var source = document.getElementById('source').value;
    var destination = document.getElementById('destination').value;
  
    var searchQuery = {
      source: source,
      destination: destination
    };
  
    makeRequest('/search', 'POST', searchQuery, function (error, results) {
      if (error) {
        console.error('Error:', error);
      } else {
        displayResults(results);
      }
    });
  }
  
  // Function to display the search results
  function displayResults(results) {
    var resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
  
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No flights found.</p>';
    } else {
      results.forEach(function (flight) {
        var flightElement = document.createElement('div');
        flightElement.innerHTML = `
          <h3>${flight.airline}</h3>
          <p>From: ${flight.source}</p>
          <p>To: ${flight.destination}</p>
          <p>Departure: ${flight.departure}</p>
          <p>Arrival: ${flight.arrival}</p>
          <button onclick="bookTicket('${flight._id}')">Book Ticket</button>
        `;
        resultsContainer.appendChild(flightElement);
      });
    }
  
    resultsContainer.style.display = 'block';
  }
  
  // Function to handle the booking of a ticket
  function bookTicket(flightId) {
    makeRequest('/book', 'POST', { flightId: flightId }, function (error, response) {
      if (error) {
        console.error('Error:', error);
      } else {
        alert('Ticket booked successfully!');
      }
    });
  }
  
  // Add event listener to the form submit event
  document.getElementById('searchForm').addEventListener('submit', handleFormSubmit);
  