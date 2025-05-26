using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel.Channels;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
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

        private int _currentGroupIndex = 0;
        private int _highestGroupIndex = 0;

        private string _errorWindowTitle = "Uh oh! Wrong Number!";
        private string _errorWindowContent { get { return "The correct sequence is: " + _correctGroupNumber; } }

        private string _successWindowTitle = "Congratulations!";
        private string _successWindowContent = "Try the next 10 digits and see how you do!";
        private string _successRestartGroupsContent = "Try it from the beginning now!";

        private string _trainingCompletedTitle = "Awesome! Congratulations!";
        private string _trainingCompletedMessage = "You've finished all this app can teach you! Go out there and show off that big brain, Einstein! Starting back at the beginning.";

        // This is probably a really terrible way of storing Pi, but it's a prototype
        private const string Pi = "141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132000568127145263560827785771342757789609173637178721468440901224953430146549585371050792279689258923542019956112129021960864034418159813629774771309960518707211349999998372978049951059731732816096318595024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303598253490428755468731159562863882353787593751957781857780532171226806613001927876611195909216420198"; 

        // Constructor
        public MainPage()
        {
            InitializeComponent();

            // Sample code to localize the ApplicationBar
            //BuildLocalizedApplicationBar();

            MessageWindow.Visibility = Visibility.Collapsed;
            CorrectNumbersTextBlock.Visibility = Visibility.Collapsed;
            _correctGroupNumber = Pi.Substring(0, 10);
        }

        private void NumberButton_Click(object sender, RoutedEventArgs e)
        {
            _currentInputNumbers += (sender as Button).Content;
            NumbersInputTextBox.Text = _currentInputNumbers;
            if (_currentGroupIndex == 99)
            {
                MessageWindowContentTextBlock.Text = _trainingCompletedMessage;
                MessageWindowTitleTextBlock.Text = _trainingCompletedTitle;
                _currentGroupIndex = 0;
                _highestGroupIndex = 0;
                _correctGroupNumber = Pi.Substring(_currentGroupIndex * 10, 10);
                CorrectNumbersTextBlock.Text = _correctGroupNumber;
            }
            else if (_currentInputNumbers == _correctGroupNumber)
            {
                MessageWindowContentTextBlock.Text = _successWindowContent;
                MessageWindowTitleTextBlock.Text = _successWindowTitle;
                if (_currentGroupIndex == _highestGroupIndex)
                {
                    MessageWindowContentTextBlock.Text = _successRestartGroupsContent;
                }
                MessageWindow.Visibility = System.Windows.Visibility.Visible;
            }
            else if (_currentInputNumbers != _correctGroupNumber.Substring(0, _currentInputNumbers.Length))
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


        private void ShowCorrectButton_OnClick(object sender, RoutedEventArgs e)
        {
            CorrectNumbersTextBlock.Text = _correctGroupNumber;
            CorrectNumbersTextBlock.Visibility = (CorrectNumbersTextBlock.Visibility == Visibility.Collapsed) ? Visibility.Visible : Visibility.Collapsed;
        }

        private void MessageWindowOKButton_OnClick(object sender, RoutedEventArgs e)
        {
            if (_currentInputNumbers == _correctGroupNumber)
            {
                if (_currentGroupIndex == _highestGroupIndex)
                {
                    MessageWindowContentTextBlock.Text = _successRestartGroupsContent;
                    _highestGroupIndex++;
                    _currentGroupIndex = 0;
                    _correctGroupNumber = Pi.Substring(0, 10);
                }
                else
                {
                    _currentGroupIndex++;
                    _correctGroupNumber = Pi.Substring(_currentGroupIndex * 10, 10);
                    CorrectNumbersTextBlock.Text = _correctGroupNumber;
                }
            }
            else
            {
                
            }
            MessageWindow.Visibility = Visibility.Collapsed;
            ClearInputNumbers();
        }

        private void ClearInputNumbers()
        {
            _currentInputNumbers = "";
            NumbersInputTextBox.Text = _currentInputNumbers;
        }
    }
}