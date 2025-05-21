page 50100 "User Details List"
{
    PageType = List;

    SourceTable = "User_Details";
    ApplicationArea =All;
    UsageCategory=Lists;
    // CardPageId="Radio Show Card";

    layout
    {
        area(content)
        {
            repeater(Group)
            {
                field("No."; Rec."No_") { ApplicationArea = Basic; }
                field("First Name"; Rec."FirstName") { ApplicationArea = Basic; }
                field("Last Name"; Rec."LastName") { ApplicationArea = Basic; }
                field("Email"; Rec.Email) { ApplicationArea = Basic; }
                field("Password"; Rec.Password) { ApplicationArea = Basic; }
                field("Profile Image"; Rec.Password) { ApplicationArea = Basic; }
                field("City"; Rec.City) { ApplicationArea = Basic; }
                field("Postal Code"; Rec."PostalCode") { ApplicationArea = Basic; }
                field("Biography"; Rec.Biography) { ApplicationArea = Basic; }
                field("Gender"; Rec.Gender) { ApplicationArea = Basic; }
                field("Phone"; Rec.Phone) { ApplicationArea = Basic; }
                field("Role"; Rec.Role) { ApplicationArea = Basic; }
                field("Verified"; Rec.Verified) { ApplicationArea = Basic; }
                field("Secret"; Rec.Secret) { ApplicationArea = Basic; }
            }
        }


    }


}