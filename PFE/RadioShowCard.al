page 50101 "Radio Show Card"
{
    PageType = Card;

    SourceTable = "Radio Show";
    ApplicationArea = All;


    layout
    {
        area(content)
        {
            group(General)
            {
                field("No."; Rec."No.") { ApplicationArea = Basic; }
                field("Radio Show Type"; Rec."Radio Show Type") { ApplicationArea = Basic; }
                field("Name"; Rec."Name") { ApplicationArea = Basic; }
                field("Run Time"; Rec."Run Time") { ApplicationArea = Basic; }
                field("Host Code"; Rec."Host Code") { ApplicationArea = Basic; }
                field("Host Name"; Rec."Host Name") { ApplicationArea = Basic; }
                field("Average Listeners"; Rec."Average Listeners") { ApplicationArea = Basic; }
                field("Audience Share"; Rec."Audience Share") { ApplicationArea = Basic; }
                field("Advertising Revenue"; Rec."Advertising Revenue") { ApplicationArea = Basic; }
                field("Royalty Cost"; Rec."Royalty Cost") { ApplicationArea = Basic; }
            }
        }

    }
    actions
    {
        area(Reporting)
        {
            action(RadioShow)
            {
                trigger OnAction()
                var
                    RepRadio: Report "Radio Show Report";
                    RecRadioShow: Record "Radio Show";
                begin
                    RecRadioShow.Reset();
                    RecRadioShow.SetRange("No.", Rec."No.");
                    if RecRadioShow.FindSet() then begin
                        RepRadio.SetTableView(RecRadioShow);
                        RepRadio.Run();
                    end;


                end;
            }
        }
    }


}