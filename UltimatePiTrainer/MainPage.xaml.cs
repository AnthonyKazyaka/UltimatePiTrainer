using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using UltimatePiTrainer.Resources;

namespace UltimatePiTrainer
{
    public partial class MainPage : PhoneApplicationPage
    {


        private string _correctGroupNumber = "";
        private string _currentInputNumbers = "";

        private string _errorWindowTitle = "Uh oh! Wrong Number!";
        private string _errorWindowContent { get { return "The correct sequence is: " + _correctGroupNumber; } }

        private string _successWindowTitle = "Congratulations!";
        private string _successWindowContent = "

        // Constructor
        public MainPage()
        {
            InitializeComponent();

            // Sample code to localize the ApplicationBar
            //BuildLocalizedApplicationBar();
        }

        private void NumberButton_Click(object sender, RoutedEventArgs e)
        {
            _currentInputNumbers += (sender as Button).Content;
            if (_currentInputNumbers == _correctGroupNumber)
            {
                MessageWindowContentTextBlock.Text = 
            }
            if (_currentInputNumbers != _correctGroupNumber.Substring(0, _correctGroupNumber.Length))
            {
                MessageWindowTitleTextBlock.Text = _errorWindowTitle;
                MessageWindowContentTextBlock.Text = _errorWindowContent;
                MessageWindow.Visibility = System.Windows.Visibility.Visible;
            }
        }

        // Sample code for building a localized ApplicationBar
        //private void BuildLocalizedApplicationBar()
        //{
        //    // Set the page's ApplicationBar to a new instance of ApplicationBar.
        //    ApplicationBar = new ApplicationBar();

        //    // Create a new button and set the text value to the localized string from AppResources.
        //    ApplicationBarIconButton appBarButton = new ApplicationBarIconButton(new Uri("/Assets/AppBar/appbar.add.rest.png", UriKind.Relative));
        //    appBarButton.Text = AppResources.AppBarButtonText;
        //    ApplicationBar.Buttons.Add(appBarButton);

        //    // Create a new menu item with the localized string from AppResources.
        //    ApplicationBarMenuItem appBarMenuItem = new ApplicationBarMenuItem(AppResources.AppBarMenuItemText);
        //    ApplicationBar.MenuItems.Add(appBarMenuItem);
        //}
    }
}