import 'react-phone-input-2/lib/style.css'
import './AccountInfo.css';
import moment from 'moment';
import 'moment/locale/ko';
import PhoneInput from 'react-phone-input-2'
import { useRef, useState } from 'react';

function AccountInfo() {
    const [account, setAccount] = useState('');
    const [currentOccupier, setCurrentOccupier] = useState('');
    const [newOccupier, setNewOccupier] = useState('');
    const [endTime, setEndTime] = useState('');

    var now = moment().format('HH:mm');
    const [requestEndTime, setRequestEndTime] = useState(now);

    // label visibilities
    const [startErrorVisible, setStartErrorVisible] = useState('');

    const [occupySuccessVisible, setOccupySuccessVisible] = useState('');
    const [occupyErrorVisible, setOccupyErrorVisible] = useState('');

    const [releaseSuccessVisible, setReleaseSuccessVisible] = useState('');
    const [releaseErrorVisible, setReleaseErrorVisible] = useState('');

    const [alarmSuccessVisible, setAlarmSuccessVisible] = useState('');
    const [alarmErrorVisible, setAlarmErrorVisible] = useState('');


    // default error messages
    const DEFAULT_ERROR = "현재 서버에 연결할 수 없습니다.";
    const EMPTY_USER_ERROR = "사용자 이름을 입력해주세요.";
    const EMPTY_PHONE_ERROR = "문자를 받으실 번호를 입력해주세요.";

    const [startError, setStartError] = useState(DEFAULT_ERROR);
    const [occupyError, setOccupyError] = useState(DEFAULT_ERROR);
    const [releaseError, setReleaseError] = useState(DEFAULT_ERROR);
    const [alarmError, setAlarmError] = useState(DEFAULT_ERROR);

    const [country, setCountry] = useState('kr');
    const [phoneNumber, setPhoneNumber] = useState('');

    // reference for phone number
    const phoneNumberRef = useRef();

    function onStartError() {
        setStartErrorVisible(true);
    }

    function onOccupyError(message) {
        setOccupyError(message);

        // hide start error
        setStartErrorVisible(false);

        // show occupy error
        setOccupyErrorVisible(true);
        setOccupySuccessVisible(false);

        // hide release error/success
        setReleaseErrorVisible(false);
        setReleaseSuccessVisible(false);
    }

    function onOccupySuccess() {
        // hide start error
        setStartErrorVisible(false);

        // show occupy success
        setOccupyErrorVisible(false);
        setOccupySuccessVisible(true);

        // hide release error/success
        setReleaseErrorVisible(false);
        setReleaseSuccessVisible(false);
    }

    function onReleaseError(message) {
        setReleaseError(message);

        // hide start error
        setStartErrorVisible(false);

        // hide occupy error/success
        setOccupyErrorVisible(false);
        setOccupySuccessVisible(false);

        // show release error
        setReleaseErrorVisible(true);
        setReleaseSuccessVisible(false);
    }

    function onReleaseSuccess() {
        // hide start error
        setStartErrorVisible(false);

        // hide occupy error/success
        setOccupyErrorVisible(false);
        setOccupySuccessVisible(false);

        // show release success
        setReleaseErrorVisible(false);
        setReleaseSuccessVisible(true);
    }

    function onAlarmError(message) {
        setAlarmError(message);

        setAlarmErrorVisible(true);
        setAlarmSuccessVisible(false);
    }

    function onAlarmSuccess() {
        setAlarmErrorVisible(false);
        setAlarmSuccessVisible(true);
    }

    fetch('https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing/')
        .then(response => response.json())
        .then(result => {
            setAccount(result.account);
            setCurrentOccupier(result.occupier);
            setEndTime(result.endtime);
        })
        .catch(error => onStartError());

    function onNameChange(event) {
        setNewOccupier(event.target.value);
    }

    function onRequestEndTimeChange(event) {
        setRequestEndTime(event.target.value);
    }

    function onAddHalfHour(event) {
        event.preventDefault();
        setRequestEndTime(moment(requestEndTime, 'HH:mm').add(30, 'minutes').format('HH:mm'));
    }

    function onAddHour(event) {
        event.preventDefault();
        setRequestEndTime(moment(requestEndTime, 'HH:mm').add(1, 'hours').format('HH:mm'));
    }

    function onSubmitOccupation(event) {
        event.preventDefault();

        if (newOccupier == "") {
            onOccupyError(EMPTY_USER_ERROR);
            return;
        }

        fetch(
            'https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset="utf-8"' },
            body: JSON.stringify(
                {
                    occupier: newOccupier,
                    endtime: requestEndTime
                }),
        }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    throw new Error(response.error);
                }
            }
            )
            .then(result => {
                // update time labels
                setEndTime(result.endtime);
                setRequestEndTime(moment().format('HH:mm'));

                // update occupier labels
                setAccount(result.account);
                setCurrentOccupier(result.occupier);
                setNewOccupier("");

                onOccupySuccess();
            })
            .catch(error => {
                onOccupyError(DEFAULT_ERROR);
            });
    }

    function onSubmitRelease(event) {
        event.preventDefault();

        fetch(
            'https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset="utf-8"' },
            body: "",
        }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    throw new Error(response.error);
                }
            })
            .then(result => {
                setAccount(result.account);
                setCurrentOccupier(result.occupier);
                setEndTime(result.endtime);
                setNewOccupier("");

                onReleaseSuccess();
            })
            .catch(error => {
                onReleaseError(DEFAULT_ERROR);
            });
    }

    function onSubmitPhoneNumber(event) {
        event.preventDefault();

        if (phoneNumber == "" || phoneNumber == phoneNumberRef.current.state.selectedCountry.countryCode) {
            // console.log(phoneNumberRef.current.state);
            onAlarmError(EMPTY_PHONE_ERROR);
            return;
        }

        fetch(
            ' https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing/alarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset="utf-8"' },
            body: JSON.stringify(
                {
                    number: phoneNumber.replace(new RegExp(phoneNumberRef.current.state.selectedCountry.countryCode, 'g'), ''),
                    country: phoneNumberRef.current.state.selectedCountry.iso2,
                }),
        }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    throw new Error(response.error);
                }
            }
            )
            .then(result => {
                onAlarmSuccess();
            })
            .catch(error => {
                console.log(error);
                onAlarmError(DEFAULT_ERROR);
            });

        // console.log(phoneNumber);
        // console.log(phoneNumberRef.current.state.selectedCountry.countryCode);
        // console.log(phoneNumberRef.current.state.selectedCountry.iso2);
        // console.log(phoneNumber.replace(new RegExp(phoneNumberRef.current.state.selectedCountry.countryCode, 'g'), ''));
    }

    function onProfileSelect(event) {
        event.preventDefault();
        setNewOccupier(event.target.getAttribute('profile'));
    }

    return (
        <div>
            <header id="header">
                <h1 id="account">{account}</h1>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css"
                />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
            </header>

            {
                currentOccupier === "" ?
                    <p id="current-status">아직 아무도 계정에 접속하지 않았습니다.<br />&nbsp;</p>
                    : <p id="current-status">현재 <strong>{currentOccupier}</strong> 님이 접속 중입니다.
                        <br />접속 종료 예정: <strong>{endTime}</strong></p>
            }

            <form id="profile-form">
                <button id="bc-btn" type="button" profile="BC" className="profile-btn" onClick={onProfileSelect}>
                    <img id="bc-img" profile="BC" src="/profile/bc.png" />
                </button>

                <button id="dp-btn" type="button" profile="DP" className="profile-btn" onClick={onProfileSelect}>
                    <img id="dp-img" profile="DP" src="/profile/dp.png" />
                </button>

                <button id="ac-btn" type="button" profile="AC" className="profile-btn" onClick={onProfileSelect}>
                    <img id="ac-img" profile="AC" src="/profile/ac.png" />
                </button>

                <button id="aw-btn" type="button" profile="AW" className="profile-btn" onClick={onProfileSelect}>
                    <img id="aw-img" profile="AW" src="/profile/aw.jpg" />
                </button>
            </form>

            <form>
                <input type="text" id="namer" required pattern="[a-zA-Z0-9\s]+" value={newOccupier} placeholder="새 사용자 이름" onChange={onNameChange} />
                <input type="time" id="time" value={requestEndTime} onChange={onRequestEndTimeChange} />
                <div className="message visible">까지 예약하겠습니까?</div>
            </form>

            <form id="signup-form">
                <button type="button" onClick={onAddHalfHour} >+30분</button>
                <button type="button" onClick={onAddHour} >+1시간</button>
                <button className="blue" type="button" id="useBtn" onClick={onSubmitOccupation} >예약</button>
                <button className="red" type="button" id="releaseBtn" onClick={onSubmitRelease} >사용 완료</button>
            </form>

            <form>
                {
                    occupySuccessVisible ? <div className="message success visible">{endTime} 까지 예약되었습니다.</div> : ""
                }
                {
                    releaseSuccessVisible ? <div className="message success visible">접속을 종료했습니다.</div> : ""
                }
                {
                    startErrorVisible ? <div className="message failure visible">{startError}</div> : ""
                }
                {
                    occupyErrorVisible ? <div className="message failure visible">{occupyError}</div> : ""
                }
                {
                    releaseErrorVisible ? <div className="message failure visible">{releaseError}</div> : ""
                }
            </form>
            <hr className="solid"></hr>
            <div className="message visible">계정 사용 가능 알림</div>
            <PhoneInput
                ref={phoneNumberRef}
                id="CustomPhoneInput"
                country={country}
                onlyCountries={[country]}
                disableDropdown={true}
                countryCodeEditable={false}
                value={phoneNumber}
                onChange={setPhoneNumber} />
            <form>
                <div className="message visible">해당 번호로 문자 알림을 받습니다.</div>
            </form>

            <form id="signup-form">
                <button className="blue" type="button" id="useBtn" onClick={onSubmitPhoneNumber} >알림 신청</button>
            </form>

            <form>
                {
                    alarmSuccessVisible ? <div className="message success visible">알림을 설정했습니다.</div> : ""
                }
                {
                    alarmErrorVisible ? <div className="message failure visible">{alarmError}</div> : ""
                }
            </form>
        </div>
    );
}



export default AccountInfo;