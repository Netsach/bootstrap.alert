Readme
======

Install
-------

``bower install bootstrap-alert``

Include in HTML
---------------

::

     <script type="text/javascript" src="bootstrap.alert.js">

Dependancies
------------

::

            
        <link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.css" >
        <link rel="stylesheet" type="text/css" href="bower_components/timecircles/inc/TimeCircles.css" >
        <script type="text/javascript" src="bower_components/jquery/dist/jquery.js" >
        <script type="text/javascript" src="bower_components/bootstrap/dist/js/bootstrap.js" >
        <script type="text/javascript" src="bower_components/timecircles/inc/TimeCircles.js" >
        <script type="text/javascript" src="bower_components/underscore/underscore.js" >
            
        

How to use it
-------------

Quick Start
~~~~~~~~~~~

For use this plugin you just need to call him whith

::

    $.alert(options);

Options
~~~~~~~

Options is an object and can have the following properties:

-  **title**: Modal title
-  **body**: Modal body text,
-  **is\_delayed**: Did add a timer to the modal for close it?
-  **close\_after\_calback\_confirm**: Did the modal close after click
   on confirm message?
-  **close\_after\_calback\_decline**: Did the modal close after click
   on decline message?
-  **callback\_confirm**: Function to call after click on confirm
   message
-  **callback\_decline**: Function to call after click on decline
   message
-  **text\_confirm**: Text to display on confirm button
-  **text\_decline**: Text to display on decline button
-  **extra\_class**: You can add your own class for customize your modal
-  **timer\_modal**: The time of the timer if the is\_delayed is true
-  **click\_outside\_for\_close**: Did we close the modal if we click
   everywhere outside the modal?
-  **type**: Can be sucess, info, warning, danger or empty for change
   modal aspect (bootstrap class)

If no properties are pass to the plugin then it wiell start with defaut
options

Additionnal information
-----------------------

You can make a modal with only on button (text\_confirm text\_decline)
if none of this buttons have text then the text-confirm will be
automaticaly seted

You can't pop several modal
